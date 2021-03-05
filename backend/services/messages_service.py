from typing import Any, Dict, Tuple

from backend.database_handler_entity import mongo


def create_message(body: Dict, user_id: str) -> Tuple[Dict, int]:
    if not body.get("to_users", False) or not body.get("message", False):
        return {"message": "Invalid body content"}, 403

    for user in body["to_users"]:
        mongo.create_message(user_id, user, body["message"])

    return {}, 201


def get_users_with_permissions(document_id: str, user_id: str) -> Tuple[Any, int]:
    document = mongo.find_document(document_id)
    if document is None:
        return {"message": "No such document"}, 404

    users = mongo.get_users_with_permissions_to_document(
        document["_id"], document["company"], user_id
    )

    return users, 200
