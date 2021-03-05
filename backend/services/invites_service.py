from typing import Dict, Optional, Tuple, cast

from backend.mongodb_handler import mongo


def get_invites(user_id: str) -> Tuple[Dict, int]:
    if (user_invite := mongo.select_invite(user_id)) is None:
        return {"message": "No invite"}, 404
    else:
        document_id = str(user_invite["invite_document"])
        document = cast(Dict, mongo.find_document(document_id))
        return (
            {
                "document_name": document["document_name"],
                "document_id": str(document["_id"]),
                "invite_id": str(user_invite["_id"]),
            },
            200,
        )


def create_invite(user_identifier: str, body: Optional[Dict]) -> Tuple[Dict, int]:
    if not body:
        return {}, 400

    user = mongo.find_user_by_name(body["username"])
    if user is None or str(user["_id"]) == user_identifier:
        return {"message": "Invalid identification data!"}, 403

    document = cast(Dict, mongo.find_document(body["document"]))

    if (
        document["company"]
        != cast(Dict, mongo.find_user_by_id(user_identifier))["company"]
    ):
        return {"message": "You should have permissions for this action!"}, 403

    if not mongo.create_invite(user["_id"], body["document"]):
        return {}, 404

    return {}, 201


def accept_invite(
    body: Optional[Dict], user_id: str, invite_id: str
) -> Tuple[Dict, int]:
    if body is None:
        return {}, 400

    if not mongo.check_user_permissions(user_id, body["document_id"]):
        mongo.accept_invite(body["document_id"], user_id)

    if not mongo.remove_invite_by_id(invite_id):
        return {}, 400

    return {}, 200


def undo_invite(invite_id: str) -> Tuple[Dict, int]:
    if not mongo.remove_invite_by_id(invite_id):
        return {}, 400

    return {}, 200
