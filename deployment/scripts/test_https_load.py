"""Run real local TLS and concurrent HTTP journeys against the production build.

Uses an isolated SQLite file, an ephemeral JWT secret, and a self-signed test
certificate trusted only by this client. Never calls an external AI provider.
"""
import argparse
import asyncio
from collections import Counter, defaultdict
from datetime import datetime, timezone
from io import BytesIO
import json
import math
import os
from pathlib import Path
import platform
import re
import secrets
import shutil
import socket
import ssl
import subprocess
import sys
import time

import httpx
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))


def percentile(values, percent):
    ordered = sorted(values)
    return round(ordered[max(0, math.ceil(len(ordered) * percent) - 1)], 2) if ordered else 0


def summarize(rows, elapsed):
    failures = [row for row in rows if not row['ok']]
    groups = defaultdict(list)
    for row in rows:
        groups[row['endpoint']].append(row['ms'])
    latencies = [row['ms'] for row in rows]
    return {
        'requests': len(rows), 'errors': len(failures), 'elapsed_seconds': round(elapsed, 2),
        'requests_per_second': round(len(rows) / elapsed, 2),
        'p50_ms': percentile(latencies, .5), 'p95_ms': percentile(latencies, .95),
        'p99_ms': percentile(latencies, .99), 'max_ms': round(max(latencies, default=0), 2),
        'status_counts': dict(Counter(str(row['status']) for row in rows)),
        'failure_examples': failures[:10],
        'endpoints': {name: {'requests': len(values), 'p95_ms': percentile(values, .95)} for name, values in groups.items()},
    }


def prepare_database(count):
    from sqlmodel import Session, SQLModel
    from backend.src.config.db import engine
    from backend.src.models.user import User
    from backend.src.models.user_history import UserHistory
    from backend.src.models.heritage_location import HeritageLocation
    from backend.src.models.chat_message import ChatMessage
    from backend.src.models.checkin_log import CheckinLog
    from backend.src.services.passwords import hash_password
    from database.seeds.seed_locations import LOCATIONS
    SQLModel.metadata.create_all(engine)
    password = secrets.token_urlsafe(18)
    password_hash = hash_password(password)
    accounts = []
    with Session(engine) as session:
        session.add_all([HeritageLocation(**row) for row in LOCATIONS])
        session.commit()
        for index in range(count):
            user = User(email=f'load-{index}@example.com', username=f'Load Visitor {index}', password_hash=password_hash)
            session.add(user)
            session.flush()
            location_id = LOCATIONS[index % len(LOCATIONS)]['location_id']
            session.add(UserHistory(user_id=user.user_id, location_id=location_id))
            accounts.append({'email': user.email, 'password': password, 'user_id': user.user_id, 'location_id': location_id})
        session.commit()
    engine.dispose()
    return accounts


async def run_checks(base_url, context, cert, accounts, stages, duration):
    async with httpx.AsyncClient(base_url=base_url, verify=context, trust_env=False, timeout=60) as client:
        for _ in range(100):
            try:
                response = await client.get('/')
                if response.status_code == 200:
                    break
            except httpx.TransportError:
                pass
            await asyncio.sleep(.2)
        else:
            raise RuntimeError('The HTTPS server did not become ready. Inspect server.log.')

        # Do not disable certificate verification: explicitly trust this test cert.
        try:
            async with httpx.AsyncClient(trust_env=False) as untrusted:
                await untrusted.get(base_url)
        except httpx.ConnectError:
            untrusted_rejected = True
        else:
            raise AssertionError('The self-signed certificate was unexpectedly trusted.')

        assets = re.findall(r'(?:src|href)="(/assets/[^"]+)"', response.text)
        assert assets, 'Production assets are missing from the HTML.'
        assert '@vite/client' not in response.text
        for asset in assets:
            result = await client.get(asset)
            assert result.status_code == 200
            assert 'immutable' in result.headers.get('cache-control', '')
        for path in ['/Explore/Ban-Do', '/Explore/Camera', '/Explore/Dang-Nhap']:
            page = await client.get(path)
            assert page.status_code == 200 and '<div id="root">' in page.text
        for path in ['/api/not-a-route', '/assets/missing.js', '/.env', '/backend/src/app/main.py']:
            assert (await client.get(path)).status_code == 404
        assert (await client.get('/api/auth/me')).status_code == 401
        visitor = {'email': 'tls-smoke@example.com', 'username': 'TLS Smoke', 'password': secrets.token_urlsafe(18)}
        assert (await client.post('/api/auth/register', json=visitor)).status_code == 201
        assert (await client.post('/api/auth/register', json=visitor)).status_code == 409
        login = await client.post('/api/auth/login', json=visitor)
        assert login.status_code == 200
        cookie = login.headers['set-cookie'].lower()
        assert all(flag in cookie for flag in ['secure', 'httponly', 'samesite=lax'])
        me = await client.get('/api/auth/me')
        assert me.status_code == 200 and me.json()['email'] == visitor['email']
        assert me.headers['cache-control'] == 'no-store'
        assert (await client.post('/api/auth/logout')).status_code == 200
        assert (await client.get('/api/auth/me')).status_code == 401

    image_buffer = BytesIO()
    Image.new('RGB', (512, 288), 'white').save(image_buffer, format='JPEG', quality=75)
    upload = image_buffer.getvalue()
    output = {'tls': {'certificate_verified': True, 'untrusted_certificate_rejected': untrusted_rejected,
                      'secure_httponly_samesite_cookie': True, 'logout_verified': True,
                      'spa_deep_links': True, 'static_assets': True, 'private_files_not_exposed': True,
                      'api_cache_disabled': True}, 'stages': []}
    for count in stages:
        rows = []
        gate = asyncio.Event()
        clients = [httpx.AsyncClient(base_url=base_url, verify=context, trust_env=False, timeout=60) for _ in range(count)]

        async def visitor_journey(index):
            account = accounts[index]
            client = clients[index]

            async def request(method, path, expected=200, validate=None, **kwargs):
                started = time.perf_counter()
                status = 0
                message = ''
                try:
                    response = await client.request(method, path, **kwargs)
                    status = response.status_code
                    ok = status == expected and (validate is None or bool(validate(response)))
                    if not ok:
                        message = f'Expected {expected}; response or user isolation check failed.'
                except Exception as error:
                    ok = False
                    message = type(error).__name__
                rows.append({'endpoint': f'{method} {path}', 'status': status, 'ok': ok,
                             'ms': (time.perf_counter() - started) * 1000, 'error': message})
                return ok

            await gate.wait()
            if not await request('POST', '/api/auth/login', json={'email': account['email'], 'password': account['password']}):
                return
            stop_at = time.perf_counter() + duration
            while time.perf_counter() < stop_at:
                await request('GET', '/Explore/Ban-Do')
                for asset in assets:
                    await request('GET', asset)
                await request('GET', '/images/heritage/khue-van-cac.webp')
                await request('GET', '/api/auth/me', validate=lambda r: r.json()['user_id'] == account['user_id'])
                await request('GET', '/api/progress', validate=lambda r: len(r.json()) == 1 and r.json()[0]['location_id'] == account['location_id'])
                await request('GET', '/api/locations', validate=lambda r: len(r.json()) == 10 and {x['id'] for x in r.json() if x['unlocked']} == {account['location_id']})
                # Real concurrent SQLite writes without billable AI: GPS must reject first.
                await request('POST', '/api/checkins/verify',
                              data={'location_id': account['location_id'], 'latitude': '0', 'longitude': '0'},
                              files={'image': ('load.jpg', upload, 'image/jpeg')},
                              validate=lambda r: r.json()['verified'] is False)
                await asyncio.sleep(.1)
            await request('POST', '/api/auth/logout')
            await request('GET', '/api/auth/me', expected=401)

        started = time.perf_counter()
        try:
            tasks = [asyncio.create_task(visitor_journey(index)) for index in range(count)]
            gate.set()
            await asyncio.gather(*tasks)
        finally:
            await asyncio.gather(*(client.aclose() for client in clients))
        summary = {'concurrent_users': count, 'journey_duration_seconds': duration, **summarize(rows, time.perf_counter() - started)}
        output['stages'].append(summary)
        print(json.dumps({k: summary[k] for k in ['concurrent_users', 'requests', 'errors', 'requests_per_second', 'p95_ms']}, ensure_ascii=True), flush=True)
    return output


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--users', default='10,25,50')
    parser.add_argument('--seconds', type=int, default=10)
    parser.add_argument('--openssl', default=shutil.which('openssl') or 'D:/Git/usr/bin/openssl.exe')
    parser.add_argument('--report', default='reports/https-load-local.json')
    args = parser.parse_args()
    stages = [int(value) for value in args.users.split(',')]
    if any(value < 1 or value > 100 for value in stages) or not 1 <= args.seconds <= 120:
        parser.error('Use 1-100 concurrent users and 1-120 seconds per journey.')
    if not (ROOT / 'frontend/dist/index.html').exists():
        parser.error('Run npm run build in frontend first.')
    work = ROOT / '.local-test' / datetime.now().strftime('%Y%m%d-%H%M%S-%f')
    work.mkdir(parents=True)
    cert, key = work / 'localhost.crt', work / 'localhost.key'
    subprocess.run([args.openssl, 'req', '-x509', '-newkey', 'rsa:2048', '-nodes',
                    '-keyout', str(key), '-out', str(cert), '-days', '2', '-subj', '/CN=localhost',
                    '-addext', 'subjectAltName=DNS:localhost,IP:127.0.0.1'],
                   check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    os.environ['DATABASE_URL'] = f"sqlite:///{(work / 'load.db').as_posix()}"
    os.environ['JWT_SECRET_KEY'] = secrets.token_urlsafe(48)
    os.environ['YESCALE_API_KEY'] = ''
    accounts = prepare_database(max(stages))
    with socket.socket() as probe:
        probe.bind(('127.0.0.1', 0))
        port = probe.getsockname()[1]
    context = ssl.create_default_context(cafile=str(cert))
    base_url = f'https://127.0.0.1:{port}'
    with (work / 'server.log').open('w', encoding='utf-8') as log:
        process = subprocess.Popen([sys.executable, '-m', 'uvicorn', 'backend.src.app.web:app',
                                    '--host', '127.0.0.1', '--port', str(port), '--workers', '1',
                                    '--ssl-keyfile', str(key), '--ssl-certfile', str(cert), '--no-access-log'],
                                   cwd=ROOT, env=os.environ.copy(), stdout=log, stderr=log)
        try:
            results = asyncio.run(run_checks(base_url, context, cert, accounts, stages, args.seconds))
            with socket.create_connection(('127.0.0.1', port)) as raw:
                with context.wrap_socket(raw, server_hostname='localhost') as connection:
                    results['tls']['protocol'] = connection.version()
                    results['tls']['cipher'] = connection.cipher()[0]
        finally:
            process.terminate()
            try:
                process.wait(timeout=10)
            except subprocess.TimeoutExpired:
                process.kill()
                process.wait()
    from sqlmodel import Session, select, func
    from backend.src.config.db import engine
    from backend.src.models.checkin_log import CheckinLog
    with Session(engine) as session:
        results['rejected_gps_rows'] = session.exec(select(func.count()).select_from(CheckinLog)).one()
    engine.dispose()
    results.update({'timestamp_utc': datetime.now(timezone.utc).isoformat(), 'environment': platform.platform(),
                    'python': platform.python_version(), 'logical_cpus': os.cpu_count(), 'workers': 1,
                    'scope': 'Local loopback HTTPS, production static build, real SQLite, real password verification; no AI calls or browser rendering.',
                    'load_model': 'Closed-loop distinct user sessions, simultaneous login, sequential mixed requests, 100 ms think time per loop; duration starts after each login.',
                    'work_directory': str(work.relative_to(ROOT))})
    report = ROOT / args.report
    report.parent.mkdir(parents=True, exist_ok=True)
    report.write_text(json.dumps(results, indent=2) + '\n', encoding='utf-8')
    print(f'Report saved to {report}', flush=True)
    if any(stage['errors'] for stage in results['stages']):
        raise SystemExit(1)


if __name__ == '__main__':
    main()
