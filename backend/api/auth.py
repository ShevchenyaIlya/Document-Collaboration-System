from typing import Any, Tuple

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from services import users_service as service

auth: Blueprint = Blueprint('auth', __name__)


@auth.route('/login', methods=["POST"])
def login() -> Tuple[Any, int]:
    body = request.get_json()

    return jsonify(service.user_login(body)), 200


@auth.route('/register', methods=["POST"])
def register() -> Tuple[Any, int]:
    body = request.get_json()

    return jsonify(service.user_register(body)), 204


@auth.route('/profile', methods=["GET"])
@jwt_required()
def profile() -> Tuple[Any, int]:
    user_id = get_jwt_identity()

    return jsonify(service.user_profile(user_id)), 200
