from flask import Flask, Response
from flask_jwt_extended import JWTManager

from .api.auth import auth
from .api.comments import comment_api
from .api.documents import document_api
from .api.invites import invite_api
from .api.messages import message_api
from .api.send_email import mail


def create_flask_app() -> Flask:
    application = Flask(__name__)

    application.config["MONGO_URI"] = "mongodb://localhost:27017/myDatabase"
    application.config["JWT_SECRET_KEY"] = "super-secret-key"

    application.config["MAIL_SERVER"] = "smtp.gmail.com"
    application.config["MAIL_PORT"] = 465
    application.config["MAIL_USERNAME"] = "onlineproductstore95@gmail.com"
    application.config["MAIL_PASSWORD"] = "OnlineProductStore"
    application.config["MAIL_USE_TLS"] = False
    application.config["MAIL_USE_SSL"] = True

    application.register_blueprint(auth)
    application.register_blueprint(document_api)
    application.register_blueprint(comment_api)
    application.register_blueprint(invite_api)
    application.register_blueprint(message_api)

    mail.init_app(application)

    return application


app = create_flask_app()
jwt = JWTManager(app)


@app.after_request
def after_request(response: Response) -> Response:
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')

    return response
