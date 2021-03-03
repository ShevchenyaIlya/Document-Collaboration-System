from typing import List

from flask_mail import Mail, Message

mail = Mail()


def send_email(recipients: List[str]) -> None:
    msg = Message(
        "Hello",
        sender="onlineproductstore95@gmail.com",
        recipients=recipients,
    )
    msg.body = "Hello Flask message sent from Flask-Mail"
    mail.send(msg)
