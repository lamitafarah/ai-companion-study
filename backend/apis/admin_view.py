import uuid
import os
from fastapi import APIRouter, FastAPI
from sqladmin import Admin, ModelView
from sqladmin.authentication import AuthenticationBackend
from starlette.requests import Request
from models.database import _DATABASE
from models.models import User, Response, NewUser
from services.user import create_user
from dotenv import load_dotenv

load_dotenv()


class AdminAuth(AuthenticationBackend):
    async def login(self, request: Request) -> bool:
        form = await request.form()
        password = form.get("password")
        if password == os.getenv("ADMIN_PASSWORD"):
            request.session.update({"authenticated": True})
            return True
        return False

    async def logout(self, request: Request) -> bool:
        request.session.clear()
        return True

    async def authenticate(self, request: Request) -> bool:
        return request.session.get("authenticated", False)


class UserAdmin(ModelView, model=User):
    column_list = [
        User.id,
        "response_count",
        User.demographics,
        User.is_admin,
        User.task_type,
        User.agent_type,
        User.survey_data,
    ]

    form_edit_rules = ["demographics", "survey_data", "task_type", "agent_type", "id"]
    form_create_rules = ["demographics", "survey_data", "task_type", "agent_type", "id"]

    form_args = {
        "demographics": {"default": {"name": "Test User"}},
        "survey_data": {"default": {"type": "A"}},
        "task_type": {"default": 0},
        "agent_type": {"default": 0},
    }

    async def insert_model(self, request: Request, data: dict):
        data["id"] = str(uuid.uuid4())
        new_user = NewUser(**data)
        user = await create_user(new_user)
        return user


class ResponseAdmin(ModelView, model=Response):
    column_list = [
        Response.id,
        Response.user_id,
        Response.task_name,
        Response.agent_type,
        Response.time_created,
        Response.initial_scores,
        Response.conv_history,
        Response.final_scores,
    ]


admin_router = APIRouter()


def setup_admin(app: FastAPI):
    authentication_backend = AdminAuth(secret_key=os.getenv("SECRET_KEY"))
    admin = Admin(
        app=app,
        engine=_DATABASE._engine,
        authentication_backend=authentication_backend
    )
    admin.add_view(UserAdmin)
    admin.add_view(ResponseAdmin)