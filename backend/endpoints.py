from typing import Any, Dict, List, Optional, Tuple, cast

from bson import ObjectId
from flask import Flask, Response, jsonify, request
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    get_jwt_identity,
    jwt_required,
)

from .document_status import Status
from .mongodb_handler import MongoDBHandler
from .role import Role


def create_flask_app() -> Flask:
    application = Flask(__name__)
    application.config["MONGO_URI"] = "mongodb://localhost:27017/myDatabase"
    application.config["JWT_SECRET_KEY"] = "super-secret-key"

    return application


app = create_flask_app()
mongo = MongoDBHandler()
jwt = JWTManager(app)


@app.route('/login', methods=["POST"])
def login() -> Tuple[Any, int]:
    nickname = request.data.decode("utf-8")
    user = mongo.find_user_by_name(nickname)

    if user is None:
        return jsonify(nickname), 404

    access_token = create_access_token(identity=str(user["_id"]))
    return jsonify(token=access_token, username=nickname, id=str(user["_id"])), 200


@app.route('/document', methods=["POST"])
@jwt_required()
def create_document() -> Tuple[Any, int]:
    document_name = request.data.decode("utf-8")
    document_identifier = mongo.create_document(document_name, get_jwt_identity())

    if document_identifier is None:
        return jsonify({"message": "Document already exist!"}), 403

    return jsonify(str(document_identifier)), 200


@app.route('/document/<identifier>', methods=["PUT", "GET", "DELETE"])
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


@app.route('/documents', methods=["GET"])
@jwt_required()
def get_documents() -> Tuple[Any, int]:
    user_identifier = get_jwt_identity()
    user: Dict = cast(Dict, mongo.find_user_by_id(ObjectId(user_identifier)))

    documents = mongo.select_document(user["company"], user["_id"])

    for document in documents:
        document.pop("content")
        document["_id"] = str(document["_id"])

    return jsonify(documents), 200


@app.route('/approve/<document_id>', methods=["POST"])
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


@app.route('/sign/<document_id>', methods=["POST"])
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


@app.route('/archive/<document_id>', methods=["POST"])
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


@app.route('/comment/<document_id>', methods=["POST"])
@jwt_required()
def leave_comment(document_id: str) -> Tuple[Any, int]:
    content = request.get_json()
    comment_id = mongo.leave_comment(
        document_id, get_jwt_identity(), content["comment"], content["target"]
    )

    if comment_id is None:
        return jsonify({}), 400

    return jsonify({"id": str(comment_id)}), 200


@app.route('/comment/<comment_id>', methods=["DELETE", "PUT"])
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


@app.route('/comments/<document_id>', methods=["GET"])
@jwt_required()
def get_document_comments(document_id: str) -> Tuple[Any, int]:
    comments = mongo.get_document_comments(document_id)

    for comment in comments:
        comment["_id"] = str(comment["_id"])

    return jsonify(comments), 200


@app.route('/invite', methods=["GET"])
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


@app.route('/invite', methods=["POST"])
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
    return jsonify(), 200


@app.route('/invite/<invite_id>', methods=["DELETE", "POST"])
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


@app.after_request
def after_request(response: Response) -> Response:
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')

    return response
