from multiprocessing import Pool
from typing import Dict, cast

from flask_mail import Mail, Message
from mongodb_handler import mongo

mail = Mail()


def send_email(operation: str, document_id: str, user_id: str) -> None:
    document = cast(Dict, mongo.find_document(document_id))
    users = mongo.get_users_with_permissions_to_document(
        document_id, document["company"], user_id
    )

    pool = Pool(processes=5)
    pool.starmap_async(
        send_single_mail, [(document_id, operation, user) for user in users]
    )


def send_single_mail(document_id: str, operation: str, user: Dict) -> None:
    message = Message(
        f"Document '{document_id}' action!",
        sender=(
            "Document collaboration system",
            "onlineproductstore95@gmail.com",
        ),
        recipients=[user["email"]],
    )
    message.body = f"Document '{document_id}' {operation} by {user['username']} from {user['company']}"
    mail.send(message)
