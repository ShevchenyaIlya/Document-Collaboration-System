from typing import Any, Dict, List, Tuple, cast

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from backend.database_handler_entity import mongo

message_api = Blueprint('message_api', __name__)


@message_api.route('/users/<document_id>', methods=["GET"])
@jwt_required()
def get_users_with_permissions(document_id: str) -> Tuple[Any, int]:
    user_id = get_jwt_identity()

    document = mongo.find_document(document_id)
    if document is None:
        return jsonify({"message": "No such document"}), 404

    users = mongo.get_users_with_permissions_to_document(
        document["_id"], document["company"], user_id
    )

    return jsonify(users), 200


@message_api.route('/messages', methods=["POST"])
@jwt_required()
def create_message() -> Tuple[Any, int]:
    user_id = get_jwt_identity()
    body = request.get_json()

    if not body.get("to_users", False) or not body.get("message", False):
        return jsonify({"message": "Invalid body content"}), 403

    for user in body["to_users"]:
        mongo.create_message(user_id, user, body["message"])

    return jsonify(), 201


@message_api.route('/messages', methods=["GET"])
@jwt_required()
def select_message() -> Tuple[Any, int]:
    user_id = get_jwt_identity()
    messages = cast(List, mongo.select_messages(user_id))

    return jsonify(messages), 200
