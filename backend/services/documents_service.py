from typing import Any, Dict, Tuple, cast

from backend.document_status import Status
from backend.mongodb_handler import mongo
from backend.role import Role

from .send_email import send_email


def create_document(body: Dict, user_id: str) -> Tuple[Any, int]:
    if not body.get("document_name", False):
        return body, 400

    document_name = body["document_name"]
    document_identifier = mongo.create_document(document_name, user_id)

    if document_identifier is None:
        return {"message": "Document already exist!"}, 409

    return str(document_identifier), 201


def get_document(document_id: str, user_identifier: str) -> Tuple[Dict, int]:
    if mongo.check_user_permissions(user_identifier, document_id):
        document_content = mongo.find_document(document_id)

        if document_content:
            return (
                {
                    "content": document_content["content"],
                    "id": str(document_content["_id"]),
                    "status": document_content["status"],
                },
                200,
            )

    return {"message": f"Document with {document_id} not found"}, 404


def delete_document(document_id: str, user_identifier: str) -> Tuple[Dict, int]:
    if not mongo.delete_document(document_id, user_identifier):
        return (
            {"message": "You should be document creator to delete this document!"},
            403,
        )

    return {}, 204


def update_document(
    document_id: str, user_identifier: str, content: Any
) -> Tuple[Dict, int]:
    if not content:
        return {"message": "Empty body"}, 400

    if content.get("operation", False):
        return update_document_state(document_id, user_identifier, content["operation"])

    return update_document_content(document_id, user_identifier, content)


def update_document_content(
    document_id: str, user_identifier: str, content: Any
) -> Tuple[Dict, int]:

    user = cast(Dict, mongo.find_user_by_id(user_identifier))
    document = mongo.find_document(document_id)

    if not document or user["company"] != document["company"]:
        return {"message": "You have no permission for that"}, 403

    mongo.update_document(document_id, "content", content)
    return {}, 204


def update_document_state(
    document_id: str, user_id: str, operation: str
) -> Tuple[Dict, int]:
    operations = {
        "approve": approve_document,
        "sign": sign_document,
        "archive": archive_document,
    }

    if not operations.get(operation, False):
        return {"message": "Invalid operation type!"}, 404
    else:
        return operations[operation](document_id, user_id)


def approve_document(document_id: str, user_id: str) -> Tuple[Dict, int]:
    document = mongo.find_document(document_id)
    user: Dict = cast(Dict, mongo.find_user_by_id(user_id))

    if not document:
        return {"message": f"Document with {document_id} not found"}, 404

    if user["role"] not in [Role.LAWYER.value, Role.ECONOMIST.value]:
        return {"message": "Invalid role for approving document!"}, 409

    if user_id in document["approved"]:
        return {"message": "Document already approved by you!"}, 409

    document["approved"].append(user_id)
    mongo.update_document(document_id, "approved", document["approved"])
    mongo.update_document(document_id, "status", Status.AGREED.value)

    send_email("approve", document_id, user_id)
    return {}, 200


def sign_document(document_id: str, user_id: str) -> Tuple[Dict, int]:
    document = cast(Dict, mongo.find_document(document_id))
    user = cast(Dict, mongo.find_user_by_id(user_id))

    if user["role"] != Role.GENERAL_DIRECTOR.value:
        return {"message": "Signing validation failed!"}, 409

    if document["status"] not in [Status.AGREED.value, Status.SIGNING.value]:
        return {"message": "You can't execute such command!"}, 409

    if not mongo.is_approved_by_company(document_id, user["company"]):
        return (
            {"message": "Wait until document approved by your company!"},
            409,
        )

    if user_id in document["signed"] or len(document["signed"]) >= 3:
        return {"message": "Already signed!"}, 409

    document["signed"].append(user_id)
    mongo.update_document(document_id, "signed", document["signed"])
    mongo.update_document(document_id, "status", Status.SIGNING.value)
    send_email("sign", document_id, user_id)

    return {}, 200


def archive_document(document_id: str, user_id: str) -> Tuple[Dict, int]:
    document: Dict = cast(Dict, mongo.find_document(document_id))
    user: Dict = cast(Dict, mongo.find_user_by_id(user_id))

    if document["company"] != user["company"]:
        return (
            {"message": "You should be member of company created this document!"},
            403,
        )

    if document["status"] != Status.SIGNING.value or len(document["signed"]) < 2:
        return {"message": "Sign document before archive!"}, 403

    mongo.update_document(document_id, "status", Status.ARCHIVE.value)
    send_email("archive", document_id, user_id)

    return {}, 200
