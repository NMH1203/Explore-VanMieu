from pwdlib import PasswordHash

# Initialize password hasher using recommended algorithm (Argon2 / bcrypt)
password_hasher = PasswordHash.recommended()


# Securely hash a plaintext password
def hash_password(password: str) -> str:
    return password_hasher.hash(password)


# Verify a plaintext password against a stored hash
def verify_password(password: str, hashed_password: str) -> bool:
    return password_hasher.verify(password, hashed_password)

    