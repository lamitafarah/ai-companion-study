from datetime import datetime
from typing import List
from pydantic import BaseModel, conint
from sqlalchemy import JSON, Column
from sqlmodel import Field, SQLModel, Relationship


class NewUser(SQLModel, table=False):
    demographics: dict = Field(default_factory=dict, sa_column=Column(JSON))
    survey_data: dict = Field(default_factory=dict, sa_column=Column(JSON))
    agent_type: conint(ge=0, le=1) = Field(default_factory=int)
    task_type: conint(ge=0, le=1) = Field(default_factory=int)
    id: str | None = Field(default=None, primary_key=True)


class User(NewUser, table=True):
    is_admin: bool
    agent_type: str = Field(default_factory=str)
    task_type: str = Field(default_factory=str)
    demographics: dict = Field(default_factory=dict, sa_column=Column(JSON))
    survey_data: dict = Field(default_factory=dict, sa_column=Column(JSON))
    responses: List["Response"] = Relationship(back_populates="user")

    @property
    def response_count(self) -> int:
        """Return the count of responses linked to the user."""
        return len(self.responses)


# PartialUser is used in updating a user where `id` is the only required field to be sent in the request
class PartialUser(BaseModel):
    id: str
    demographics: dict | None = Field(None)
    survey_data: dict | None = Field(None)
    task_type: str | None = Field(None)
    agent_type: str | None = Field(None)


class NewResponse(SQLModel, table=False):
    task_name: str
    agent_type: str = Field(default="")
    initial_scores: dict = Field(default_factory=dict, sa_column=Column(JSON))
    conv_history: dict = Field(default_factory=dict, sa_column=Column(JSON))
    final_scores: dict = Field(default_factory=dict, sa_column=Column(JSON))
    user_id: str = Field(foreign_key="user.id")

class Response(NewResponse, table=True):
    id: int | None = Field(primary_key=True, exclude=True)
    time_created: datetime
    user: "User" = Relationship(back_populates="responses")  # Proper relationship


class LLMInput(BaseModel):
    user_id: str
    task_id: str
    message: str
    map: list
    interaction: int = 1


class LLMResponse(BaseModel):
    error: str | None = None
    response: str
    agent_data: dict


class ErrorResponse(BaseModel):
    detail: str
