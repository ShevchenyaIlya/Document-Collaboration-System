from flask import Flask, Response, g
from flask_jwt_extended import JWTManager

from .api.auth import auth
from .api.comments import comment_api
from .api.documents import document_api
from .api.invites import invite_api


def create_flask_app() -> Flask:

    application = Flask(__name__)
    application.register_blueprint(auth)
    application.register_blueprint(document_api)
    application.register_blueprint(comment_api)
    application.register_blueprint(invite_api)
    application.config["MONGO_URI"] = "mongodb://localhost:27017/myDatabase"
    application.config["JWT_SECRET_KEY"] = "super-secret-key"

    return application


app = create_flask_app()
jwt = JWTManager(app)


@app.after_request
def after_request(response: Response) -> Response:
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')

    return response
