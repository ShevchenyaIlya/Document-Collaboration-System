from typing import Any, Dict, Tuple, cast

from bson import ObjectId
from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from backend.database_handler_entity import mongo
from backend.document_status import Status
from backend.role import Role

document_api = Blueprint('document_api', __name__)


@document_api.route('/documents', methods=["POST"])
@jwt_required()
def create_document() -> Tuple[Any, int]:
    body = request.get_json()

    if not body.get("document_name", False):
        return jsonify(body), 400

    document_name = body["document_name"]
    document_identifier = mongo.create_document(document_name, get_jwt_identity())

    if document_identifier is None:
        return jsonify({"message": "Document already exist!"}), 409

    return jsonify(str(document_identifier)), 201


@document_api.route('/documents/<document_id>', methods=["PUT", "GET", "DELETE"])
@jwt_required()
def update_document_content(document_id: str) -> Tuple[Any, int]:
    user_id = get_jwt_identity()

    if request.method == "GET":
        response = get_document(document_id, user_id)
    elif request.method == "PUT":
        response = update_document(document_id, request.get_json())
    else:
        response = delete_document(document_id, user_id)

    return response


def get_document(document_id: str, user_identifier: str) -> Tuple[Any, int]:
    if mongo.check_user_permissions(user_identifier, document_id):
        document_content = mongo.find_document(document_id)

        if document_content:
            return (
                jsonify(
                    content=document_content["content"],
                    id=str(document_content["_id"]),
                    status=document_content["status"],
                ),
                200,
            )

    return jsonify({"message": f"Document with {document_id} not found"}), 404


def update_document(document_id: str, content: Any) -> Tuple[Any, int]:
    if not content:
        return jsonify({{"message": "Empty body"}}), 400

    mongo.update_document(document_id, "content", content)
    return jsonify(), 204


def delete_document(document_id: str, user_identifier: str) -> Tuple[Any, int]:
    if not mongo.delete_document(document_id, user_identifier):
        return (
            jsonify(
                {"message": "You should be document creator to delete this document!"}
            ),
            403,
        )

    return jsonify(), 204


@document_api.route('/documents', methods=["GET"])
@jwt_required()
def get_documents() -> Tuple[Any, int]:
    user_identifier = get_jwt_identity()
    user: Dict = cast(Dict, mongo.find_user_by_id(user_identifier))

    documents = mongo.select_document(user["company"], user["_id"])

    return jsonify(documents), 200


@document_api.route('/approve/<document_id>', methods=["POST"])
@jwt_required()
def approve_document(document_id: str) -> Tuple[Any, int]:
    user_identifier = get_jwt_identity()
    document = mongo.find_document(document_id)
    user: Dict = cast(Dict, mongo.find_user_by_id(user_identifier))

    if not document:
        return jsonify({"message": f"Document with {document_id} not found"}), 404

    if user["role"] not in [Role.LAWYER, Role.ECONOMIST]:
        return jsonify({"message": "Invalid role for approving document!"}), 409

    if user_identifier in document["approved"]:
        return jsonify({"message": "Document already approved by you!"}), 409

    document["approved"].append(user_identifier)
    mongo.update_document(document_id, "approved", document["approved"])
    mongo.update_document(document_id, "status", Status.AGREED)

    return jsonify({}), 204


@document_api.route('/sign/<document_id>', methods=["POST"])
@jwt_required()
def sign_document(document_id: str) -> Tuple[Any, int]:
    user_identifier = get_jwt_identity()
    document = cast(Dict, mongo.find_document(document_id))
    user = cast(Dict, mongo.find_user_by_id(user_identifier))

    if user["role"] != Role.GENERAL_DIRECTOR:
        return jsonify({"message": "Signing validation failed!"}), 409

    if document["status"] not in [Status.AGREED, Status.SIGNING]:
        return jsonify({"message": "You can't execute such command!"}), 409

    if not mongo.is_approved_by_company(document_id, user["company"]):
        return (
            jsonify({"message": "Wait until document approved by your company!"}),
            409,
        )

    if user_identifier in document["signed"] or len(document["signed"]) >= 3:
        return jsonify({"message": "Already signed!"}), 409

    document["signed"].append(user_identifier)
    mongo.update_document(document_id, "signed", document["signed"])
    mongo.update_document(document_id, "status", Status.SIGNING)

    return jsonify({}), 204


@document_api.route('/archive/<document_id>', methods=["POST"])
@jwt_required()
def archive_document(document_id: str) -> Tuple[Any, int]:
    user_identifier = get_jwt_identity()
    document: Dict = cast(Dict, mongo.find_document(document_id))
    user: Dict = cast(Dict, mongo.find_user_by_id(user_identifier))

    if document["company"] != user["company"]:
        return (
            jsonify(
                {"message": "You should be member of company created this document!"}
            ),
            403,
        )

    if document["status"] != Status.SIGNING or len(document["signed"]) < 2:
        return jsonify({"message": "Sign document before archive!"}), 403

    mongo.update_document(document_id, "status", Status.ARCHIVE)

    return jsonify({}), 200


@document_api.route('/documents/<document_id>/comments', methods=["POST"])
@jwt_required()
def leave_comment(document_id: str) -> Tuple[Any, int]:
    content = request.get_json()
    comment_id = mongo.leave_comment(
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


@document_api.route('/documents/<document_id>/comments', methods=["GET"])
@jwt_required()
def get_document_comments(document_id: str) -> Tuple[Any, int]:
    comments = mongo.get_document_comments(document_id)

    for comment in comments:
        comment["_id"] = str(comment["_id"])

    return jsonify(comments), 200
