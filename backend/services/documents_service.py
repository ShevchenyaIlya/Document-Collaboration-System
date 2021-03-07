from typing import Any, Dict, List, cast

from backend.document_status import Status
from backend.http_exception import HTTPException
from backend.mongodb_handler import mongo
from backend.role import Role

from .email_sender import send_email


def create_document(body: Dict, user_id: str) -> str:
    if not body.get("document_name", False):
        raise HTTPException("Incorrect body content", 400)

    document_name = body["document_name"]
    document_id = mongo.create_document(document_name, user_id)

    if document_id is None:
        raise HTTPException("Document already exist!", 409)

    return str(document_id)


def get_document(document_id: str, user_identifier: str) -> Dict:
    if mongo.check_user_permissions(user_identifier, document_id):
        document_content = mongo.find_document(document_id)

        if document_content:
            return {
                "content": document_content["content"],
                "id": str(document_content["_id"]),
                "status": document_content["status"],
            }

    raise HTTPException(f"Document with {document_id} not found", 404)


def get_documents(user_id: str) -> List:
    user: Dict = cast(Dict, mongo.find_user_by_id(user_id))

    if not user:
        raise HTTPException(f"User {user_id} not found", 404)

    documents = mongo.select_document(user["company"], user["_id"])

    return documents


def delete_document(document_id: str, user_identifier: str) -> Dict:
    if not mongo.delete_document(document_id, user_identifier):
        raise HTTPException(
            "You should be document creator to delete this document!", 403
        )

    return {}


def update_document(document_id: str, user_identifier: str, content: Any) -> Dict:
    if not content:
        raise HTTPException("Empty body", 400)

    if content.get("operation", False):
        return update_document_state(document_id, user_identifier, content["operation"])

    return update_document_content(document_id, user_identifier, content)


def update_document_content(document_id: str, user_id: str, content: Any) -> Dict:

    user = cast(Dict, mongo.find_user_by_id(user_id))
    document = mongo.find_document(document_id)

    if not document or user["company"] != document["company"]:
        raise HTTPException("You have no permission for that", 403)

    mongo.update_document(document_id, "content", content)
    return {}


def update_document_state(document_id: str, user_id: str, operation: str) -> Dict:
    operations = {
        "approve": approve_document,
        "sign": sign_document,
        "archive": archive_document,
    }

    if not operations.get(operation, False):
        raise HTTPException("Invalid operation type!", 404)

    return operations[operation](document_id, user_id)


def approve_document(document_id: str, user_id: str) -> Dict:
    document = mongo.find_document(document_id)
    user: Dict = cast(Dict, mongo.find_user_by_id(user_id))

    if not document:
        raise HTTPException(f"Document with {document_id} not found", 404)

    if user["role"] not in [Role.LAWYER.value, Role.ECONOMIST.value]:
        raise HTTPException("Invalid role for approving document!", 409)

    if user_id in document["approved"]:
        raise HTTPException("Document already approved by you!", 409)

    document["approved"].append(user_id)
    mongo.update_document(document_id, "approved", document["approved"])
    mongo.update_document(document_id, "status", Status.AGREED.value)

    send_email("approve", document_id, user_id)
    return {}


def sign_document(document_id: str, user_id: str) -> Dict:
    document = cast(Dict, mongo.find_document(document_id))
    user = cast(Dict, mongo.find_user_by_id(user_id))

    if user["role"] != Role.GENERAL_DIRECTOR.value:
        raise HTTPException("Signing validation failed!", 409)

    if document["status"] not in [Status.AGREED.value, Status.SIGNING.value]:
        raise HTTPException("You can't execute such command!", 409)

    if not mongo.is_approved_by_company(document_id, user["company"]):
        raise HTTPException("Wait until document approved by your company!", 409)

    if user_id in document["signed"] or len(document["signed"]) >= 3:
        raise HTTPException("Already signed!", 409)

    document["signed"].append(user_id)
    mongo.update_document(document_id, "signed", document["signed"])
    mongo.update_document(document_id, "status", Status.SIGNING.value)
    send_email("sign", document_id, user_id)

    return {}


def archive_document(document_id: str, user_id: str) -> Dict:
    document: Dict = cast(Dict, mongo.find_document(document_id))
    user: Dict = cast(Dict, mongo.find_user_by_id(user_id))

    if document["company"] != user["company"]:
        raise HTTPException(
            "You should be member of company created this document!", 403
        )

    if document["status"] != Status.SIGNING.value or len(document["signed"]) < 2:
        raise HTTPException("Sign document before archive!", 409)

    mongo.update_document(document_id, "status", Status.ARCHIVE.value)
    send_email("archive", document_id, user_id)

    return {}


def get_users_with_permissions(document_id: str, user_id: str) -> List:
    document = mongo.find_document(document_id)

    if document is None:
        raise HTTPException("Document not found", 404)

    users = mongo.get_users_with_permissions_to_document(
        document["_id"], document["company"], user_id
    )

    return users


def create_comment(document_id: str, user_id: str, content: Dict) -> Dict:
    if not content.get("comment", False) or not content.get("target", False):
        raise HTTPException("Incorrect body content", 400)

    comment_id = mongo.create_comment(
        document_id, user_id, content["comment"], content["target"]
    )

    if comment_id is None:
        raise HTTPException("Incorrect comment information", 400)

    return {"id": str(comment_id)}


def delete_comment(comment_id: str) -> None:
    mongo.delete_comment(comment_id)


def update_comment(comment_id: str, content: Dict) -> None:
    if not content.get("comment", False):
        raise HTTPException("Incorrect body content", 400)

    mongo.update_comment(comment_id, content["comment"])


def get_document_comments(document_id: str) -> List:
    comments = mongo.get_document_comments(document_id)

    if not comments:
        raise HTTPException("Invalid document identifier", 400)

    return comments
