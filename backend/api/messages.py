from typing import Any, Tuple

import services.messages_service as service
from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

message_api = Blueprint('message_api', __name__)


@message_api.route('/messages', methods=["POST"])
@jwt_required()
def create_message() -> Tuple[Any, int]:
    user_id = get_jwt_identity()
    body = request.get_json()

    return jsonify(service.create_message(body, user_id)), 201


@message_api.route('/messages', methods=["GET"])
@jwt_required()
def select_message() -> Tuple[Any, int]:
    user_id = get_jwt_identity()

    return jsonify(service.get_messages(user_id)), 200
