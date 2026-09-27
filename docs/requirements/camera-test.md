# Local camera test mode

Create an ignored `.env.camera-test` in the repository root:

```env
CAMERA_TEST_ENABLED=true
CAMERA_TEST_USER_ID=the-root-account-user-id
```

Restart the backend. Sign in as the configured account, open Camera and choose
"Test bằng ảnh có sẵn". Select a site (stars indicate the five journey targets),
then press the shutter. Unlocks are persisted to this account. Complete all five
targets to exercise the theme and one-time digital reward claim in Passport.
"Dùng camera thật" returns to normal GPS/photo verification.

The backend authorizes the immutable account ID, not an editable username.
Disabled or unauthorized captures return 403. Test events are recorded as
`test_verified`, not real GPS/image verifications. They count toward rewards only
for the configured account while test mode is enabled. Existing reward claims
remain persisted after disabling test mode. Set CAMERA_TEST_ENABLED=false and
restart to turn it off. Do not enable this configuration in production.
