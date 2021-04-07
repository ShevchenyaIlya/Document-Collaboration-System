import os
from distutils.util import strtobool
from typing import cast


class Config:
    def __init__(self) -> None:
        self.JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "super-secret-key")
        self.MAIL_SERVER = os.environ.get("MAIL_SERVER", "smtp.gmail.com")
        self.MAIL_PORT = int(cast(str, os.environ.get("MAIL_PORT", 465)))
        self.MAIL_USERNAME = os.environ.get(
            "MAIL_USERNAME", "onlineproductstore95@gmail.com"
        )
        self.MAIL_PASSWORD = os.environ.get("MAIL_PASSWORD", "OnlineProductStore")
        self.MAIL_USE_TLS = strtobool(
            cast(str, os.environ.get("MAIL_USE_TLS", "False"))
        )
        self.MAIL_USE_SSL = strtobool(cast(str, os.environ.get("MAIL_USE_SSL", "True")))


CONFIG = Config()
