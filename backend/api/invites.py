from typing import Any, Dict, Tuple, cast

from bson import ObjectId
from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from backend.database_handler_entity import mongo

invite_api = Blueprint('invite_api', __name__)


@invite_api.route('/invite', methods=["GET"])
@jwt_required()
def invite() -> Tuple[Any, int]:
    user_id = ObjectId(get_jwt_identity())

    if (user_invite := mongo.select_invite(user_id)) is None:
        return jsonify({}), 204
    else:
        document_id = str(user_invite["invite_document"])
        document = cast(Dict, mongo.find_document(document_id))
        return (
            jsonify(
                {
                    "document_name": document["document_name"],
                    "document_id": str(document["_id"]),
                    "invite_id": str(user_invite["_id"]),
                }
            ),
            200,
        )


@invite_api.route('/invite', methods=["POST"])
@jwt_required()
def create_invite() -> Tuple[Any, int]:
    body = request.get_json()
    user_identifier = get_jwt_identity()

    if body is None or not ObjectId.is_valid(body["document"]):
        return jsonify({}), 400

    user = mongo.find_user_by_name(body["username"])
    if user is None or str(user["_id"]) == user_identifier:
        return jsonify({"message": "Invalid identification data!"}), 403

    document = cast(Dict, mongo.find_document(body["document"]))

    if (
        document["company"]
        != cast(Dict, mongo.find_user_by_id(ObjectId(user_identifier)))["company"]
    ):
        return jsonify({"message": "You should have permissions for this action!"}), 403

    mongo.add_invite(user["_id"], ObjectId(body["document"]))
    return jsonify(), 201


@invite_api.route('/invite/<invite_id>', methods=["DELETE", "POST"])
@jwt_required()
def accept_invite(invite_id: str) -> Tuple[Any, int]:
    if not ObjectId.is_valid(invite_id):
        return jsonify(), 400

    invite_id = ObjectId(invite_id)

    if request.method == "POST":
        body = request.get_json()
        user_id = ObjectId(get_jwt_identity())

        if body is None:
            return jsonify(), 400

        if not mongo.check_user_permissions(user_id, body["document_id"]):
            mongo.accept_invite(body["document_id"], user_id)

    mongo.remove_invite_by_id(invite_id)

    return jsonify(), 200
