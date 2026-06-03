import uuid
from sqlalchemy import delete, select, func, update
from sqlalchemy.orm import selectinload

from config import AuthConfig
from models.database import get_session
from models.models import NewUser, PartialUser, User
from services.logging import get_logger


logger = get_logger()

AGENT_TYPE_MAPPING = {
    0: "Neutral",
    1: "Manipulator",
}

TASK_TYPE_MAPPING = {
    0: "Companion",
    1: "Companion",
}


async def _create_user(user: User) -> User | None:
    if user.id is None:
        user.id = str(uuid.uuid4())
    async with get_session() as session:
        session.add(user)
        try:
            await session.commit()
        except Exception as e:
            logger.warning(f"Cannot create new user {user.model_dump()}: {str(e)}")
            return None
        await session.refresh(user)
    return user


async def create_user(new_user: NewUser) -> User | None:
    user = User(
        demographics=new_user.demographics,
        survey_data=new_user.survey_data,
        task_type=TASK_TYPE_MAPPING[int(new_user.task_type)],
        agent_type=AGENT_TYPE_MAPPING[int(new_user.agent_type)],
        is_admin=False,
        id=new_user.id,
    )
    return await _create_user(user)


async def create_admin(id: str = None) -> User:
    return await _create_user(
        User(id=id, task_type="admin", agent_type="admin", is_admin=True)
    )


async def init_admin() -> None:
    if AuthConfig.ADMIN_ID is not None:
        try:
            await create_admin(AuthConfig.ADMIN_ID)
            logger.info("Created user from ID in config")
        except Exception as e:
            logger.info(f"ID in config already exists in DB")
    async with get_session() as session:
        admin_count = await session.execute(
            select(func.count()).select_from(User).where(User.is_admin == True)
        )
    if admin_count == 0:
        logger.info(f"No admin account, creating a new one")
        await create_admin()


async def get_all_users() -> list[User]:
    async with get_session() as session:
        return list((await session.execute(select(User))).scalars())


async def get_all_users_tasks() -> list[User]:
    async with get_session() as session:
        result = await session.execute(
            select(User).options(selectinload(User.responses))
        )
        return result.scalars().all()


async def get_user(user_id: str) -> User | None:
    async with get_session() as session:
        query = select(User).where(User.id == user_id)
        result = await session.execute(query)
        return result.scalar_one_or_none()


async def update_user(user: PartialUser) -> bool:
    updated_fields = user.model_dump(exclude={"id"}, exclude_none=True)
    if not updated_fields:
        return True
    async with get_session() as session:
        results = await session.execute(
            update(User).where(User.id == user.id).values(**updated_fields)
        )
        await session.commit()
    return results.rowcount > 0

# call in the future if we want to delete a user's data
async def delete_user(user_id) -> bool:
    async with get_session() as session:
        results = await session.execute(delete(User).where(User.id == user_id))
        await session.commit()
    return results.rowcount > 0


async def get_user_responses():
    users = await get_all_users_tasks()
    user_data = []
    for user in users:
        user_dict = {
            "id": user.id,
            "is_admin": user.is_admin,
            "agent_type": user.agent_type,
            "task_type": user.task_type,
            "demographics": user.demographics,
            "survey_data": user.survey_data,
            "response_count": user.response_count,
            "responses": [
                {
                    "id": response.id,
                    "task_name": response.task_name,
                    "initial_scores": response.initial_scores,
                    "conv_history": response.conv_history,
                    "final_scores": response.final_scores,
                    "time_created": response.time_created.isoformat(),
                }
                for response in user.responses
            ],
        }
        user_data.append(user_dict)
    return user_data