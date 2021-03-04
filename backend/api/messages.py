from typing import Any, Dict, List, Tuple, cast

from bson import ObjectId
from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from backend.database_handler_entity import mongo

message_api = Blueprint('message_api', __name__)


@message_api.route('/users/<document_id>', methods=["GET"])
@jwt_required()
def invite(document_id: str) -> Tuple[Any, int]:
    user_id = ObjectId(get_jwt_identity())

    document = mongo.find_document(document_id)
    if document is None:
        return jsonify({"message": "No such document"}), 404

    users = mongo.select_company_users(document["company"])
    users.extend(mongo.get_users_with_permissions(document["_id"]))
    users = list(filter(lambda x: x["_id"] != user_id, users))

    for user in users:
        user["_id"] = str(user["_id"])

    return jsonify(users), 200


@message_api.route('/message', methods=["POST"])
@jwt_required()
def create_message() -> Tuple[Any, int]:
    user_id = ObjectId(get_jwt_identity())
    body = request.get_json()

    if not body.get("to_users", False) or not body.get("message", False):
        return jsonify({"message": "Invalid body content"}), 403

    if isinstance(body["to_users"], str):
        mongo.create_message(user_id, ObjectId(body["to_users"]), body["message"])
    elif isinstance(body["to_users"], list):
        for user in body["to_users"]:
            mongo.create_message(user_id, ObjectId(user), body["message"])

    return jsonify(), 200


@message_api.route('/messages', methods=["GET"])
@jwt_required()
def select_message() -> Tuple[Any, int]:
    user_id = ObjectId(get_jwt_identity())
    messages = cast(List, mongo.select_messages(user_id))

    for message in messages:
        message.pop("user_to")
        message["_id"] = str(message["_id"])
        message["user_from"] = cast(
            Dict, mongo.find_user_by_id(message["user_from"])
        ).get("username")

    return jsonify(messages), 200
