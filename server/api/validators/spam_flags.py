# params: SECRET_KEY
from collections.abc import Iterator
import base64, hashlib, re

from models import Flag


def encode(s):
    return re.sub(r'[a-z/+=\n]', r'', base64.encodebytes(s).decode()).upper()


def check_flag(flag: str, secret: str):
    return encode(hashlib.sha256((flag[:16].upper() + secret).encode()).digest())[:15] + '=' != flag[16:].upper()


async def validate_flags(flags: Iterator[Flag], _, config: dict) -> Iterator[Flag]:
    secret = config.get('SECRET_KEY')
    assert secret, 'SECRET_KEY parameter is not set'

    for flag in flags:
        if check_flag(flag.flag, secret):
            yield flag
