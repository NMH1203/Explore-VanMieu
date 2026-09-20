from pydantic import EmailStr
from sqlmodel import Field, SQLModel

"the data model recive api ank send back api"
class RegisterRequest(SQLModel):
    email: EmailStr
    password: str = Field(min_length=8)
    username: str | None = None


class UserResponse(SQLModel):
    user_id: str
    email: str
    username: str | None

class LoginRequest(SQLModel):
    email: EmailStr
    password: str

