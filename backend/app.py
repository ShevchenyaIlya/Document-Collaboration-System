from flask import Flask, Response, jsonify
from flask_jwt_extended import JWTManager

from .api.auth import auth
from .api.documents import document_api
from .api.invites import invite_api
from .api.messages import message_api
from .config import CONFIG
from .http_exception import HTTPException
from .services.email_sender import mail


def create_flask_app() -> Flask:
    application = Flask(__name__)

    application.config.from_object(CONFIG)

    application.register_blueprint(auth)
    application.register_blueprint(document_api)
    application.register_blueprint(invite_api)
    application.register_blueprint(message_api)

    mail.init_app(application)

    return application


app = create_flask_app()
jwt = JWTManager(app)


@app.errorhandler(HTTPException)
def handle_invalid_usage(error: HTTPException) -> Response:
    response = jsonify(error.to_dict())
    response.status_code = error.status_code
    return response


@app.after_request
def after_request(response: Response) -> Response:
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')

    return response
