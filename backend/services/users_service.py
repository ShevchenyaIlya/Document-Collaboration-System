from typing import Dict

from flask_jwt_extended import create_access_token

from backend.http_exception import HTTPException
from backend.mongodb_handler import mongo
from backend.role import role_validation


def user_login(body: Dict) -> Dict:
    if not body.get("username", False):
        raise HTTPException(f"Incorrect body content {body}!", 400)

    username = body["username"]
    user = mongo.find_user_by_name(username)

    if user is None:
        raise HTTPException(f"User {username} not found!", 404)

    access_token = create_access_token(identity=str(user["_id"]))

    return {
        "token": access_token,
        "username": username,
        "id": str(user["_id"]),
    }


def user_register(body: Dict) -> str:
    fields = ['company', 'username', 'user_role', 'email']

    if any(field not in body for field in fields):
        raise HTTPException("Incorrect body content", 400)

    if not role_validation(body["user_role"]):
        raise HTTPException("Invalid user role", 404)

    user_id = mongo.create_user(
        body["username"], body["user_role"], body["company"], body["email"]
    )

    if not user_id:
        raise HTTPException("User exist or reached company members limit", 403)

    return str(user_id)


def user_profile(user_id: str) -> Dict:
    user = mongo.find_user_by_id(user_id)

    if user is None:
        raise HTTPException("Such user does not exist", 409)

    user["_id"] = str(user["_id"])

    return user
