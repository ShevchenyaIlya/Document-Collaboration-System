import os
from distutils.util import strtobool
from typing import cast


class Config:
    def __init__(self) -> None:
        self.JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
        self.MAIL_SERVER = os.getenv("MAIL_SERVER")
        self.MAIL_PORT = int(cast(str, os.getenv("MAIL_PORT")))
        self.MAIL_USERNAME = os.getenv("MAIL_USERNAME")
        self.MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")
        self.MAIL_USE_TLS = strtobool(cast(str, os.getenv("MAIL_USE_TLS")))
        self.MAIL_USE_SSL = strtobool(cast(str, os.getenv("MAIL_USE_SSL")))


CONFIG = Config()
