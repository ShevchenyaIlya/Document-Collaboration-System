from typing import Any, Tuple

from flask import Blueprint, jsonify, request

from backend.services import users_service as service

auth: Blueprint = Blueprint('auth', __name__)


@auth.route('/login', methods=["POST"])
def login() -> Tuple[Any, int]:
    body = request.get_json()

    return jsonify(service.user_login(body)), 200


@auth.route('/register', methods=["POST"])
def register() -> Tuple[Any, int]:
    body = request.get_json()

    return jsonify(service.user_register(body)), 204
