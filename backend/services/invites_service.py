from typing import Dict, Optional, Tuple, cast

from http_exception import HTTPException
from mongodb_handler import mongo
from services.email_sender import send_single_mail


def get_invites(user_id: str) -> Dict:
    if (user_invite := mongo.select_invite(user_id)) is None:
        return {}
    else:
        document_id = str(user_invite["invite_document"])
        document = cast(Dict, mongo.find_document(document_id))
        return {
            "document_name": document["document_name"],
            "document_id": str(document["_id"]),
            "invite_id": str(user_invite["_id"]),
        }


def create_invite(user_identifier: str, body: Dict) -> Dict:
    user = mongo.find_user_by_name(body["username"])
    if user is None or str(user["_id"]) == user_identifier:
        raise HTTPException("Invalid identification data!", 403)

    document = cast(Dict, mongo.find_document(body["document"]))

    if (
        document["company"]
        != cast(Dict, mongo.find_user_by_id(user_identifier))["company"]
    ):
        raise HTTPException("You should have permissions for this action!", 403)

    if not mongo.create_invite(user["_id"], body["document"]):
        raise HTTPException("Document not found!", 404)

    send_single_mail(str(document["_id"]), "invite to accept", user)
    return {}


def accept_invite(body: Dict, user_id: str, invite_id: str) -> Dict:
    if not mongo.check_user_permissions(user_id, body["document_id"]):
        mongo.accept_invite(body["document_id"], user_id)

    if not mongo.remove_invite_by_id(invite_id):
        raise HTTPException("Incorrect invite identifier!", 400)

    return {}


def undo_invite(invite_id: str) -> Dict:
    if not mongo.remove_invite_by_id(invite_id):
        raise HTTPException("Incorrect invite identifier!", 400)

    return {}
