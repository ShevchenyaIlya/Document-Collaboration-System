from typing import Any, Tuple

from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token

from backend.database_handler_entity import mongo

auth: Blueprint = Blueprint('auth', __name__)


@auth.route('/login', methods=["POST"])
def login() -> Tuple[Any, int]:
    nickname = request.data.decode("utf-8")
    user = mongo.find_user_by_name(nickname)

    if user is None:
        return jsonify(nickname), 404

    access_token = create_access_token(identity=str(user["_id"]))
    return jsonify(token=access_token, username=nickname, id=str(user["_id"])), 200
