from datetime import datetime
from typing import Any, Dict, List, Optional, cast

from bson.objectid import ObjectId
from pymongo import MongoClient

from .document_status import Status
from .role import Role
from .validators import role_validation


class MongoDBHandler:
    def __init__(self) -> None:
        self.client = MongoClient(port=27017)
        self.db = self.client.myDatabase

    def create_user(
        self, username: str, user_role: str, company: str
    ) -> Optional[ObjectId]:
        if (
            role_validation(user_role)
            and not self.user_exist(username, company)
            and self.is_company_user_limit(company, user_role)
        ):
            return self.db.users.insert_one(
                {
                    "username": username,
                    "role": user_role,
                    "company": company,
                }
            ).inserted_id

        return None

    def find_user_by_name(self, nickname: str) -> Optional[Dict]:
        return self.db.users.find_one({"username": nickname})

    def find_user_by_id(self, user_identifier: str) -> Optional[Dict]:
        if not ObjectId.is_valid(user_identifier):
            return None

        return self.db.users.find_one({"_id": ObjectId(user_identifier)})

    def user_exist(self, username: str, company: str) -> bool:
        return (
            self.db.users.count_documents(
                {"username": username, "company": company}, limit=1
            )
            != 0
        )

    def update_user_role(self, user_id: str, new_role: str) -> None:
        if role_validation(new_role) and ObjectId.is_valid(user_id):
            user: Dict = cast(Dict, self.find_user_by_id(user_id))
            company = user["company"]

            if self.is_company_user_limit(company, new_role):
                self.db.users.update_one(
                    {"_id": ObjectId(user_id)},
                    {"$set": {"role": new_role}},
                    upsert=False,
                )

    def create_document(self, document_name: str, creator: str) -> Optional[Dict]:
        user = self.find_user_by_id(creator)

        if not self.document_exist(document_name) and user is not None:
            return self.db.documents.insert_one(
                {
                    "document_name": document_name,
                    "creation_date": datetime.now(),
                    "status": Status.CREATED,
                    "creator": user["username"],
                    "company": user["company"],
                    "signed": [],
                    "approved": [],
                    "content": {},
                }
            ).inserted_id

        return None

    def update_document(self, document_id: str, field: str, content: Any) -> None:
        self.db.documents.update_one(
            {"_id": ObjectId(document_id)}, {"$set": {field: content}}, upsert=False
        )

    def is_approved_by_company(self, document_id: str, company_name: str) -> bool:
        document: Dict = cast(Dict, self.find_document(document_id))
        lawyer_approve, economist_approve = False, False

        for approved_by in document["approved"]:
            user = self.find_user_by_id(approved_by)

            if user is not None and user["company"] == company_name:
                if user["role"] == Role.LAWYER:
                    lawyer_approve = True
                elif user["role"] == Role.ECONOMIST:
                    economist_approve = True

                if lawyer_approve and economist_approve:
                    return True

        return False

    def delete_document(self, document_id: str, user_id: str) -> bool:
        user: Dict = cast(Dict, self.find_user_by_id(user_id))
        document: Dict = cast(Dict, self.find_document(document_id))

        if user["username"] == document["creator"]:
            self.db.documents.delete_one({"_id": ObjectId(document_id)})
            return True

        return False

    def document_exist(self, document_name: str) -> bool:
        return (
            self.db.documents.count_documents({"document_name": document_name}, limit=1)
            != 0
        )

    def is_company_user_limit(self, company: str, role: str) -> bool:
        user_limit = {
            Role.LAWYER: 3,
            Role.ECONOMIST: 3,
            Role.GENERAL_DIRECTOR: 1,
        }
        return (
            self.db.users.count_documents({"company": company, "role": role})
            < user_limit[role]
        )

    def find_document(self, document_id: str) -> Optional[Dict]:
        if ObjectId.is_valid(document_id):
            return self.db.documents.find_one({"_id": ObjectId(document_id)})

        return None

    def select_document(self, company: str, user_id: ObjectId) -> List:
        documents = self.select_company_documents(company)
        permissions = self.get_user_permissions(user_id)

        if len(permissions) != 0:
            documents.extend(
                [
                    self.find_document(str(permission["document"]))
                    for permission in permissions
                ]
            )

        for document in documents:
            if document:
                document["_id"] = str(document["_id"])
            else:
                documents.remove(document)

        return documents

    def select_company_documents(self, company: str) -> List:
        return list(self.db.documents.find({"company": company}, {"content": 0}))

    def select_company_users(self, company: str) -> List:
        return list(self.db.users.find({"company": company}))

    def leave_comment(
        self, document_id: str, author: str, comment: str, commented_text: str
    ) -> Optional[Dict]:
        user: Dict = cast(Dict, self.find_user_by_id(author))

        return self.db.comments.insert_one(
            {
                "author": user["username"],
                "document_id": document_id,
                "creation_date": datetime.now(),
                "commented_text": commented_text,
                "comment": comment,
            }
        ).inserted_id

    def update_comment(self, comment_id: ObjectId, comment: Optional[Dict]) -> None:
        if self.comment_exists(comment_id) and comment is not None:
            self.db.comments.update_one(
                {"_id": ObjectId(comment_id)},
                {"$set": {"comment": comment}},
                upsert=False,
            )

    def delete_comment(self, comment_id: ObjectId) -> None:
        self.db.comments.delete_one({"_id": comment_id})

    def comment_exists(self, comment_id: ObjectId) -> bool:
        return self.db.comments.count_documents({"_id": comment_id}, limit=1) != 0

    def get_document_comments(self, document_id: str) -> List:
        return list(self.db.comments.find({"document_id": document_id}))

    def select_invite(self, user_id: ObjectId) -> Optional[Dict]:
        return self.db.invites.find_one({"user": user_id})

    def remove_invite(self, user_id: ObjectId, document_id: ObjectId) -> None:
        self.db.invites.delete_one({"user": user_id, "invite_document": document_id})

    def remove_invite_by_id(self, invite_id: ObjectId) -> None:
        self.db.invites.delete_one({"_id": invite_id})

    def add_invite(self, user_id: ObjectId, document_id: ObjectId) -> None:
        invite = {"user": user_id, "invite_document": document_id}
        self.db.invites.update_one(invite, {"$set": invite}, upsert=True)

    def accept_invite(self, document_id: str, user_id: str) -> None:
        user_id = ObjectId(user_id)
        permission = {"document": document_id, "user": user_id}
        self.db.permissions.update_one(permission, {"$set": permission}, upsert=True)

    def get_user_permissions(self, user_id: ObjectId) -> List:
        return list(self.db.permissions.find({"user": user_id}))

    def get_users_with_permissions(self, document_id: ObjectId) -> List:
        permissions_list = list(self.db.permissions.find({"document": document_id}))
        users = []

        if len(permissions_list) != 0:
            users = [
                self.find_user_by_id(str(permission["_id"]))
                for permission in permissions_list
            ]

        return users

    def check_user_permissions(self, user_id: str, document_id: str) -> bool:
        user: Dict = cast(Dict, self.find_user_by_id(user_id))
        document: Dict = cast(Dict, self.find_document(document_id))
        user_id = ObjectId(user_id)
        have_permissions = False

        if (
            document
            and document["company"] == user["company"]
            or self.db.permissions.find_one({"user": user_id, "document": document_id})
            is not None
        ):
            have_permissions = True

        return have_permissions

    def create_message(
        self, user_from: ObjectId, user_to: ObjectId, message: str
    ) -> None:
        user = self.find_user_by_id(str(user_to))

        if user:
            new_message = {
                "user_from": user_from,
                "user_to": user["_id"],
                "message": message,
                "send_date": datetime.now(),
            }
            self.db.messages.update_one(new_message, {"$set": new_message}, upsert=True)

    def select_messages(self, user_id: ObjectId) -> List:
        return list(self.db.messages.find({"user_to": user_id}))
