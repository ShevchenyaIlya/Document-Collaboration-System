from typing import Any, Tuple

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

import backend.services.invites_service as service

invite_api = Blueprint('invite_api', __name__)


@invite_api.route('/invite', methods=["GET", "POST"])
@jwt_required()
def invite() -> Tuple[Any, int]:
    user_id = get_jwt_identity()

    if request.method == "GET":
        return jsonify(service.get_invites(user_id)), 200
    else:
        body = request.get_json()
        return jsonify(service.create_invite(user_id, body)), 201


@invite_api.route('/invite/<invite_id>', methods=["POST", "DELETE"])
@jwt_required()
def accept_invite(invite_id: str) -> Tuple[Any, int]:
    user_id = get_jwt_identity()

    if request.method == "DELETE":
        return jsonify(service.undo_invite(invite_id)), 200
    else:
        body = request.get_json()
        return jsonify(service.accept_invite(body, user_id, invite_id)), 200
