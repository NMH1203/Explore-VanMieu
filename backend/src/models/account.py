"""Account and authentication API contracts."""

from pydantic import BaseModel, ConfigDict, Field, field_validator


class Credentials(BaseModel):
    model_config = ConfigDict(extra="forbid")

    email: str = Field(min_length=5, max_length=254)
    password: str = Field(min_length=8, max_length=128)

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        if "@" not in value or value.startswith("@") or value.endswith("@"):
            raise ValueError("Invalid email address.")
        return value


class Registration(Credentials):
    name: str = Field(min_length=2, max_length=100)


class AccountStatus(BaseModel):
    authenticated: bool
    id: str | None = None
    name: str | None = None
    email: str | None = None


class AuthResponse(BaseModel):
    token: str
    account: AccountStatus
