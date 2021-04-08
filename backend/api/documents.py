from typing import Any, Tuple

import services.documents_service as service
from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

document_api = Blueprint('document_api', __name__)


@document_api.route('/documents', methods=["POST"])
@jwt_required()
def create_document() -> Tuple[Any, int]:
    body = request.get_json()
    document_id = service.create_document(body, get_jwt_identity())

    return jsonify(document_id), 201


@document_api.route('/documents/<document_id>', methods=["PUT", "GET", "DELETE"])
@jwt_required()
def update_document_content(document_id: str) -> Tuple[Any, int]:
    user_id = get_jwt_identity()

    if request.method == "GET":
        return jsonify(service.get_document(document_id, user_id)), 200
    elif request.method == "PUT":
        return (
            jsonify(service.update_document(document_id, user_id, request.get_json())),
            200,
        )
    else:
        return jsonify(service.delete_document(document_id, user_id)), 204


@document_api.route('/documents', methods=["GET"])
@jwt_required()
def get_documents() -> Tuple[Any, int]:
    user_id = get_jwt_identity()
    documents = service.get_documents(user_id)

    return jsonify(documents), 200


@document_api.route('/documents/<document_id>/comments', methods=["POST"])
@jwt_required()
def leave_comment(document_id: str) -> Tuple[Any, int]:
    user_id = get_jwt_identity()
    content = request.get_json()

    return jsonify(service.create_comment(document_id, user_id, content)), 201


@document_api.route(
    '/documents/<document_id>/comments/<comment_id>', methods=["DELETE", "PUT"]
)
@jwt_required()
def modify_comment(document_id: str, comment_id: str) -> Tuple[Any, int]:
    if request.method == "DELETE":
        service.delete_comment(comment_id)
    elif request.method == "PUT":
        body = request.get_json()
        service.update_comment(comment_id, body)

    return jsonify({}), 200


@document_api.route('/documents/<document_id>/comments', methods=["GET"])
@jwt_required()
def get_document_comments(document_id: str) -> Tuple[Any, int]:
    comments = service.get_document_comments(document_id)

    return jsonify(comments), 200


@document_api.route('/documents/<document_id>/collaborators', methods=["GET"])
@jwt_required()
def get_users_with_permissions(document_id: str) -> Tuple[Any, int]:
    user_id = get_jwt_identity()
    return jsonify(service.get_users_with_permissions(document_id, user_id)), 200
