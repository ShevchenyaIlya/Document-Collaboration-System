from typing import Any, Dict, Tuple, cast

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

import backend.services.documents_service as service
from backend.mongodb_handler import mongo

document_api = Blueprint('document_api', __name__)


@document_api.route('/documents', methods=["POST"])
@jwt_required()
def create_document() -> Tuple[Any, int]:
    body = request.get_json()
    body, status_code = service.create_document(body, get_jwt_identity())

    return jsonify(body), status_code


@document_api.route('/documents/<document_id>', methods=["PUT", "GET", "DELETE"])
@jwt_required()
def update_document_content(document_id: str) -> Tuple[Any, int]:
    user_id = get_jwt_identity()

    if request.method == "GET":
        body, status_code = service.get_document(document_id, user_id)
    elif request.method == "PUT":
        body, status_code = service.update_document(
            document_id, user_id, request.get_json()
        )
    else:
        body, status_code = service.delete_document(document_id, user_id)

    return jsonify(body), status_code


@document_api.route('/documents', methods=["GET"])
@jwt_required()
def get_documents() -> Tuple[Any, int]:
    user_identifier = get_jwt_identity()
    user: Dict = cast(Dict, mongo.find_user_by_id(user_identifier))

    documents = mongo.select_document(user["company"], user["_id"])

    return jsonify(documents), 200


@document_api.route('/documents/<document_id>/comments', methods=["POST"])
@jwt_required()
def leave_comment(document_id: str) -> Tuple[Any, int]:
    content = request.get_json()
    comment_id = mongo.create_comment(
        document_id, get_jwt_identity(), content["comment"], content["target"]
    )

    if comment_id is None:
        return jsonify({}), 400

    return jsonify({"id": str(comment_id)}), 201


@document_api.route(
    '/documents/<document_id>/comments/<comment_id>', methods=["DELETE", "PUT"]
)
@jwt_required()
def modify_comment(document_id: str, comment_id: str) -> Tuple[Any, int]:
    if request.method == "DELETE":
        mongo.delete_comment(comment_id)
    elif request.method == "PUT":
        body = request.get_json()
        mongo.update_comment(comment_id, body["comment"])

    return jsonify({}), 200


@document_api.route('/documents/<document_id>/comments', methods=["GET"])
@jwt_required()
def get_document_comments(document_id: str) -> Tuple[Any, int]:
    comments = mongo.get_document_comments(document_id)

    return jsonify(comments), 200
