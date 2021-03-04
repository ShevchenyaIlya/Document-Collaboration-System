from typing import Any, Dict, Tuple, cast

from bson import ObjectId
from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from backend.database_handler_entity import mongo
from backend.document_status import Status
from backend.role import Role

document_api = Blueprint('document_api', __name__)


@document_api.route('/document', methods=["POST"])
@jwt_required()
def create_document() -> Tuple[Any, int]:
    document_name = request.data.decode("utf-8")
    document_identifier = mongo.create_document(document_name, get_jwt_identity())

    if document_identifier is None:
        return jsonify({"message": "Document already exist!"}), 403

    return jsonify(str(document_identifier)), 201


@document_api.route('/document/<identifier>', methods=["PUT", "GET", "DELETE"])
@jwt_required()
def update_document_content(identifier: str) -> Tuple[Any, int]:
    if request.method == "GET":
        if mongo.check_user_permissions(ObjectId(get_jwt_identity()), identifier):
            document_content = mongo.find_document(identifier)

            if document_content is not None:
                return (
                    jsonify(
                        content=document_content["content"],
                        id=str(document_content["_id"]),
                        status=document_content["status"],
                    ),
                    200,
                )

        return jsonify({}), 404
    elif request.method == "PUT":
        content = request.get_json()
        mongo.update_document(identifier, "content", content)
    elif request.method == "DELETE":
        user_identifier = get_jwt_identity()
        if not mongo.delete_document(identifier, user_identifier):
            return jsonify(
                {"message": "You should be document creator to delete this document!"}
            )

    return jsonify({}), 200


@document_api.route('/documents', methods=["GET"])
@jwt_required()
def get_documents() -> Tuple[Any, int]:
    user_identifier = get_jwt_identity()
    user: Dict = cast(Dict, mongo.find_user_by_id(ObjectId(user_identifier)))

    documents = mongo.select_document(user["company"], user["_id"])

    for document in documents:
        document.pop("content")
        document["_id"] = str(document["_id"])

    return jsonify(documents), 200


@document_api.route('/approve/<document_id>', methods=["POST"])
@jwt_required()
def approve_document(document_id: str) -> Tuple[Any, int]:
    user_identifier = get_jwt_identity()
    document: Dict = cast(Dict, mongo.find_document(document_id))
    user: Dict = cast(Dict, mongo.find_user_by_id(ObjectId(user_identifier)))

    if user["role"] not in [Role.LAWYER, Role.ECONOMIST]:
        return jsonify({"message": "Invalid role for approving document!"}), 403

    if user_identifier in document["approved"]:
        return jsonify({"message": "Document already approved by you!"}), 403

    document["approved"].append(user_identifier)
    mongo.update_document(document_id, "approved", document["approved"])
    mongo.update_document(document_id, "status", Status.AGREED)

    return jsonify({}), 200


@document_api.route('/sign/<document_id>', methods=["POST"])
@jwt_required()
def sign_document(document_id: str) -> Tuple[Any, int]:
    user_identifier = get_jwt_identity()
    document = cast(Dict, mongo.find_document(document_id))
    user = cast(Dict, mongo.find_user_by_id(ObjectId(user_identifier)))

    if (
        user["role"] != Role.GENERAL_DIRECTOR
        or document["status"] not in [Status.AGREED, Status.SIGNING]
        or not mongo.is_approved_by_company(document_id, user["company"])
    ):
        return jsonify({"message": "Signing validation failed!"}), 403

    if user_identifier in document["signed"] or len(document["signed"]) >= 3:
        return jsonify({"message": "Already signed!"})

    document["signed"].append(user_identifier)
    mongo.update_document(document_id, "signed", document["signed"])
    mongo.update_document(document_id, "status", Status.SIGNING)

    return jsonify({}), 200


@document_api.route('/archive/<document_id>', methods=["POST"])
@jwt_required()
def archive_document(document_id: str) -> Tuple[Any, int]:
    user_identifier = get_jwt_identity()
    document: Dict = cast(Dict, mongo.find_document(document_id))
    user: Dict = cast(Dict, mongo.find_user_by_id(ObjectId(user_identifier)))

    if (
        document["company"] != user["company"]
        or document["status"] != Status.SIGNING
        or len(document["signed"]) < 2
    ):
        return jsonify({"message": "Sign document before archive!"}), 403

    mongo.update_document(document_id, "status", Status.ARCHIVE)

    return jsonify({}), 200
