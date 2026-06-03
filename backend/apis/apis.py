from contextlib import asynccontextmanager
from fastapi import FastAPI
from starlette.middleware.sessions import SessionMiddleware

from apis.chat import chat_router
from apis.responses import response_router
from apis.users import user_router
from apis.admin_view import admin_router, setup_admin
from fastapi.middleware.cors import CORSMiddleware

from config import ServerConfig
from models.database import _DATABASE
from services.user import init_admin

import os


@asynccontextmanager
async def lifespan(api: FastAPI):
    await _DATABASE.create()
    await init_admin()
    yield


api = FastAPI(lifespan=lifespan)

api.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

api.add_middleware(SessionMiddleware, secret_key=os.getenv("SECRET_KEY"))

setup_admin(api)

api.include_router(response_router)
api.include_router(chat_router)
api.include_router(user_router)
api.include_router(admin_router)


@api.get("/")
async def root():
    return {"message": "Welcome to the Backend ;)"}