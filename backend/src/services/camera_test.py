import os
from dotenv import load_dotenv
from backend.src.config.db import PROJECT_ROOT

load_dotenv(PROJECT_ROOT / '.env.camera-test')


def camera_test_allowed(user):
    return (os.getenv('CAMERA_TEST_ENABLED', '').lower() == 'true'
            and bool(os.getenv('CAMERA_TEST_USER_ID'))
            and user.user_id == os.getenv('CAMERA_TEST_USER_ID'))
