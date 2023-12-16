from enum import Enum
from dataclasses import dataclass

from aiohttp import web


@dataclass
class WebRequest(web.Request):
    is_auth: bool = False


class FlagStatus(Enum):
    QUEUED = 0
    SKIPPED = 1
    ACCEPTED = 2
    REJECTED = 3


@dataclass
class Flag:
    flag_id: int = None
    flag: str = None
    sploit_id: int = None
    team_id: int = None
    create_dt: str = None

    def __eq__(self, other):
        assert type(other) is Flag
        return Flag.flag_id == other.flag_id


@dataclass
class FlagSubmit:
    flag: str = None
    status_id: FlagStatus = None
    response: str = None


@dataclass
class Team:
    team_name: str
    team_ip: str
    team_id: int = None


@dataclass
class Settings:
    regex_flag_format: str
    system_protocol_id: int
    submit_flag_limit: int
    submit_period: int
    flag_lifetime: int
    round_length: int


@dataclass
class ProtocolParam:
    protocol_param_id: int
    protocol_id: int
    protocol_param_name: str
    protocol_param_value: str


@dataclass
class Validator:
    validator_id: int
    validator_name: str
    validator_params: dict
