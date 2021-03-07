from typing import Dict, List, Tuple, cast

from backend.http_exception import HTTPException
from backend.mongodb_handler import mongo


def create_message(body: Dict, user_id: str) -> Dict:
    if not body.get("to_users", False) or not body.get("message", False):
        raise HTTPException("Incorrect body content", 403)

    for user in body["to_users"]:
        mongo.create_message(user_id, user, body["message"])

    return {}


def get_messages(user_id: str) -> List:
    messages = cast(List, mongo.select_messages(user_id))

    if not messages:
        raise HTTPException("Incorrect user identifier", 403)

    return messages
