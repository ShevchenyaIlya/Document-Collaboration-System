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
        body, status_code = service.get_invites(user_id)
    else:
        body = request.get_json()
        body, status_code = service.create_invite(user_id, body)

    return jsonify(body), status_code


@invite_api.route('/invite/<invite_id>', methods=["POST", "DELETE"])
@jwt_required()
def accept_invite(invite_id: str) -> Tuple[Any, int]:
    user_id = get_jwt_identity()

    if request.method == "DELETE":
        body, status_code = service.undo_invite(invite_id)
    else:
        body = request.get_json()
        body, status_code = service.accept_invite(body, user_id, invite_id)

    return jsonify(body), status_code
