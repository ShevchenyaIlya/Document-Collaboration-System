from typing import Any, Dict, List, Tuple, cast

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

import backend.services.messages_service as service
from backend.mongodb_handler import mongo

message_api = Blueprint('message_api', __name__)


@message_api.route('/users/<document_id>', methods=["GET"])
@jwt_required()
def get_users_with_permissions(document_id: str) -> Tuple[Any, int]:
    user_id = get_jwt_identity()
    body, status_code = service.get_users_with_permissions(document_id, user_id)

    return jsonify(body), status_code


@message_api.route('/messages', methods=["POST"])
@jwt_required()
def create_message() -> Tuple[Any, int]:
    user_id = get_jwt_identity()
    body = request.get_json()
    body, status_code = service.create_message(body, user_id)

    return jsonify(body), status_code


@message_api.route('/messages', methods=["GET"])
@jwt_required()
def select_message() -> Tuple[Any, int]:
    user_id = get_jwt_identity()
    messages = cast(List, mongo.select_messages(user_id))

    return jsonify(messages), 200
