from datetime import datetime
from typing import Any, Dict, List, Optional, cast

from bson.objectid import ObjectId
from pymongo import MongoClient

from .document_status import Status
from .role import Role


class MongoDBHandler:
    def __init__(self) -> None:
        self.client = MongoClient("mongo")
        self.db = self.client.myDatabase

    def create_user(
        self, username: str, user_role: str, company: str, email: str
    ) -> Optional[ObjectId]:
        if not self.user_exist(username, company) and self.is_company_user_limit(
            company, user_role
        ):
            return self.db.users.insert_one(
                {
                    "username": username,
                    "email": email,
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
        if not ObjectId.is_valid(user_id):
            return

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
                    "status": Status.CREATED.value,
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

        for approver in document["approved"]:
            user = self.find_user_by_id(approver)

            if user and user["company"] == company_name:
                if user["role"] == Role.LAWYER.value:
                    lawyer_approve = True
                elif user["role"] == Role.ECONOMIST.value:
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
        user_limit: Dict[str, int] = {
            Role.LAWYER.value: 3,
            Role.ECONOMIST.value: 3,
            Role.GENERAL_DIRECTOR.value: 1,
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
            if document is not None:
                document["_id"] = str(document["_id"])

        documents = list(filter(None, documents))
        return documents

    def select_company_documents(self, company: str) -> List:
        return list(self.db.documents.find({"company": company}, {"content": 0}))

    def select_company_users(self, company: str) -> List:
        return list(self.db.users.find({"company": company}))

    def create_comment(
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

    def update_comment(self, comment_id: str, comment: Optional[Dict]) -> None:
        if (
            ObjectId.is_valid(comment_id)
            and self.comment_exists(ObjectId(comment_id))
            and comment
        ):
            self.db.comments.update_one(
                {"_id": ObjectId(comment_id)},
                {"$set": {"comment": comment}},
                upsert=False,
            )

    def delete_comment(self, comment_id: str) -> None:
        if ObjectId.is_valid(comment_id):
            self.db.comments.delete_one({"_id": ObjectId(comment_id)})

    def comment_exists(self, comment_id: ObjectId) -> bool:
        return self.db.comments.count_documents({"_id": comment_id}, limit=1) != 0

    def get_document_comments(self, document_id: str) -> Optional[List]:
        if not ObjectId.is_valid(document_id):
            return None

        comments = list(self.db.comments.find({"document_id": document_id}))
        for comment in comments:
            comment["_id"] = str(comment["_id"])

        return comments

    def select_invite(self, user_id: str) -> Optional[Dict]:
        if not ObjectId.is_valid(user_id):
            return None

        return self.db.invites.find_one({"user": ObjectId(user_id)})

    def remove_invite(self, user_id: ObjectId, document_id: ObjectId) -> None:
        self.db.invites.delete_one({"user": user_id, "invite_document": document_id})

    def remove_invite_by_id(self, invite_id: str) -> bool:
        if not ObjectId.is_valid(invite_id):
            return False

        self.db.invites.delete_one({"_id": ObjectId(invite_id)})
        return True

    def create_invite(self, user_id: ObjectId, document_id: str) -> bool:
        if not ObjectId.is_valid(document_id):
            return False

        invite = {"user": user_id, "invite_document": ObjectId(document_id)}
        self.db.invites.update_one(invite, {"$set": invite}, upsert=True)
        return True

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

    def create_message(self, user_from: str, user_to: str, message: str) -> None:
        if not ObjectId.is_valid(user_from) or not ObjectId.is_valid(user_to):
            return

        user = self.find_user_by_id(str(user_to))
        if user:
            new_message = {
                "user_from": user_from,
                "user_to": user["_id"],
                "message": message,
                "send_date": datetime.now(),
            }
            self.db.messages.update_one(new_message, {"$set": new_message}, upsert=True)

    def select_messages(self, user_id: str) -> Optional[List]:
        if not ObjectId.is_valid(user_id):
            return None

        messages = list(self.db.messages.find({"user_to": ObjectId(user_id)}))

        for message in messages:
            message.pop("user_to")
            message["_id"] = str(message["_id"])
            message["user_from"] = cast(
                Dict, self.find_user_by_id(str(message["user_from"]))
            ).get("username")

        return messages

    def get_users_with_permissions_to_document(
        self, document_id: str, company: str, user_id: str
    ) -> List:
        if not ObjectId.is_valid(document_id):
            return []

        users = self.select_company_users(company)
        users.extend(self.get_users_with_permissions(ObjectId(document_id)))
        users = list(filter(lambda x: x["_id"] != ObjectId(user_id), users))

        for user in users:
            user["_id"] = str(user["_id"])

        return users

    def create_document_version(self, document: Dict) -> None:
        self.db.documents_versions.insert_one(
            {
                "version_date": datetime.now(),
                "document_id": document["_id"],
                "document": document,
            }
        )

    def delete_document_versions(self, document_id: str) -> None:
        self.db.documents_versions.delete({"document_id": document_id})


mongo = MongoDBHandler()
