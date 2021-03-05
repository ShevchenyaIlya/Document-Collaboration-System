from enum import Enum
from typing import List


class Role(Enum):
    LAWYER = "Lawyer"
    ECONOMIST = "Economist"
    GENERAL_DIRECTOR = "General director"


def get_roles() -> List[str]:
    return [Role.LAWYER.value, Role.ECONOMIST.value, Role.GENERAL_DIRECTOR.value]


def role_validation(role_name: str) -> bool:
    return role_name in get_roles()
