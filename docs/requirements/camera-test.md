# Local camera test mode

Create an ignored `.env.camera-test` in the repository root:

```env
CAMERA_TEST_ENABLED=true
```

Restart the backend. Sign in as the configured account, open Camera and choose
"Test bằng ảnh có sẵn". Select a site (stars indicate the five journey targets),
then press the shutter. Unlocks are persisted to this account. Complete all five
targets to exercise the theme and one-time digital reward claim in Passport.
"Dùng camera thật" returns to normal GPS/photo verification.

Create the shared development admin after initializing and seeding locations:

```powershell
backend\.venv\Scripts\python.exe -m database.seeds.seed_demo_admin
```

Defaults are `root@example.com` / `RootTest123!`; override them through the
`DEMO_ADMIN_*` variables. The password is hashed before it enters SQLite. The
database remains local and ignored by Git. The backend authorizes `is_admin`,
not an editable username.
Disabled or unauthorized captures return 403. Test events are recorded as
`test_verified`, not real GPS/image verifications. They count toward rewards only
for the configured account while test mode is enabled. Existing reward claims
remain persisted after disabling test mode. Set CAMERA_TEST_ENABLED=false and
restart to turn it off. Do not enable this configuration in production.
