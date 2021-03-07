from enum import Enum


class Status(Enum):
    CREATED = "Created"
    AGREEMENT = "Agreement"
    AGREED = "Agreed"
    SIGNING = "Signing"
    SIGNED = "Signed"
    ARCHIVE = "Archive"
