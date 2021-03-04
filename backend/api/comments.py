from typing import Any, Tuple

from bson import ObjectId
from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from backend.database_handler_entity import mongo

comment_api = Blueprint('comment_api', __name__)


@comment_api.route('/comment/<document_id>', methods=["POST"])
@jwt_required()
def leave_comment(document_id: str) -> Tuple[Any, int]:
    content = request.get_json()
    comment_id = mongo.leave_comment(
        document_id, get_jwt_identity(), content["comment"], content["target"]
    )

    if comment_id is None:
        return jsonify({}), 400

    return jsonify({"id": str(comment_id)}), 201


@comment_api.route('/comment/<comment_id>', methods=["DELETE", "PUT"])
@jwt_required()
def modify_comment(comment_id: str) -> Tuple[Any, int]:
    if ObjectId.is_valid(comment_id):
        comment_id = ObjectId(comment_id)

        if request.method == "DELETE":
            mongo.delete_comment(comment_id)
        elif request.method == "PUT":
            body = request.get_json()
            mongo.update_comment(comment_id, body["comment"])
    else:
        return jsonify(), 422

    return jsonify({}), 200


@comment_api.route('/comments/<document_id>', methods=["GET"])
@jwt_required()
def get_document_comments(document_id: str) -> Tuple[Any, int]:
    comments = mongo.get_document_comments(document_id)

    for comment in comments:
        comment["_id"] = str(comment["_id"])

    return jsonify(comments), 200
