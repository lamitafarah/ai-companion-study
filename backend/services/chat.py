import json

from models.database import get_session
from models.models import LLMResponse, LLMInput, User
from services.agent import Agent
from services.task import Task

PERSONALITY_DESCRIPTIONS = {
    "A": "Extraversion: You are outgoing and sociable, often seeking out new social connections and enjoying lively interactions with others. Your assertive nature and high activity level make you a natural leader in group settings, and your cheerful demeanor brings energy and positivity to those around you.",
    "B": "Agreeableness: You are a kind and compassionate individual, always willing to help others and prioritize their well-being. Your strong sense of morality guides your actions, and you value trust, cooperation, and empathy in your relationships with others.",
}

async def config_agent(llm_input: LLMInput):
    agent = Agent()
    model_name = "gpt-4o"

    async with get_session() as session:
        user = await session.get(User, llm_input.user_id)
    if user is None:
        raise Exception("User not found")

    # Load tasks from new flat JSON format
    tasks = json.loads(open("services/data/tasks.json", "r", encoding="utf-8").read())
    task_data = next(
        (t for t in tasks if t["task_id"] == int(llm_input.task_id)), None
    )
    if task_data is None:
        raise Exception(f"Task {llm_input.task_id} not found")

    # Set up task
    task = Task()
    task.set_attributes(
        _id=task_data["task_id"],
        title=task_data["query"]["title"],
        desc=task_data["query"]["desc"],
        options=task_data["options"],
        hidden_incentive=task_data["hidden_incentive"],
        lang="en",
        optimal=task_data["optimal"],
    )
    task.sort_options(llm_input.map)

    # Get agent type and personality from user record
    # Flip agent type for second interaction
    if llm_input.interaction == 2:
        agent_type = "Manipulator" if user.agent_type == "Neutral" else "Neutral"
    else:
        agent_type = user.agent_type
    
    personality_type = user.survey_data.get("type", "A")
    personality = PERSONALITY_DESCRIPTIONS.get(personality_type, PERSONALITY_DESCRIPTIONS["A"])

    agent.set_attributes(model_name, agent_type, "en", personality)
    agent.set_task(task)
    agent.fill_prompt()

    if llm_input.history:
        import json as _json
        for msg in llm_input.history:
            if msg.get("role") == "user":
                agent.messages.append({"role": "user", "content": msg.get("message", "")})
            else:
                agent.messages.append({"role": "assistant", "content": _json.dumps({"response": msg.get("message", "")})})

    return agent


async def get_llm_response(llm_input: LLMInput, agent: Agent) -> LLMResponse:
    msg = {"role": "user", "content": llm_input.message}
    full_response = agent.generate(msg).get("content")
    response = full_response.get("response")
    del full_response["response"]
    return LLMResponse(response=response, agent_data=full_response)