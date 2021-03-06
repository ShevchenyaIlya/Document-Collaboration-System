from typing import Any, Tuple

from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token

from backend.mongodb_handler import mongo
from backend.role import role_validation

auth: Blueprint = Blueprint('auth', __name__)


@auth.route('/login', methods=["POST"])
def login() -> Tuple[Any, int]:
    body = request.get_json()

    if not body.get("username", False):
        return jsonify(body), 400

    nickname = body["username"]
    user = mongo.find_user_by_name(nickname)

    if user is None:
        return jsonify(nickname), 404

    access_token = create_access_token(identity=str(user["_id"]))
    return jsonify(token=access_token, username=nickname, id=str(user["_id"])), 200


@auth.route('/register', methods=["POST"])
def register() -> Tuple[Any, int]:
    body = request.get_json()
    fields = ['company', 'username', 'user_role', 'email']

    if any(field not in body for field in fields):
        return jsonify({"message": "Incorrect body content"}), 400

    if not role_validation(body["user_role"]):
        return jsonify({"message": "Invalid user role"}), 404

    user_id = mongo.create_user(
        body["username"], body["user_role"], body["company"], body["email"]
    )

    if not user_id:
        return jsonify({"message": "User exist or reached company members limit"}), 403

    return jsonify(str(user_id)), 204
