# params: SYSTEM_HOST
from collections.abc import Iterator

import jwt
import aiohttp

from models import Flag


API_PREFIX = 'api/capsule/v1'
PUBLIC_KEY_ENDPOINT = 'public_key'


async def get_public_key(host):
    async with aiohttp.ClientSession() as session:
        async with session.get(f'{host}/{API_PREFIX}/{PUBLIC_KEY_ENDPOINT}') as r:
            if r is not None and r.status == 200:
                return await r.text()

    raise ConnectionError("Could not get public key to check flags from %s." % host)


def decode(key, capsule):
    return jwt.decode(
        capsule,
        algorithms=['ES256', 'RS256'],
        key=key
    )


async def validate_flags(flags: Iterator[Flag], app, config: dict) -> Iterator[Flag]:
    host = config.get('SYSTEM_HOST')
    assert host, 'SYSTEM_HOST parameter is not set'

    key = app.get('SYSTEM_SERVER_KEY', None)

    if not key:
        key = await get_public_key(host)
        app['SYSTEM_SERVER_KEY'] = key

    for flag_obj in flags:
        flag = flag_obj.flag

        if not flag:
            continue

        if flag.startswith('VolgaCTF{'):
            flag = flag[len('VolgaCTF{'):-len('}')]

        try:
            flag_obj.flag = decode(key, flag).get('flag')
            yield flag_obj

        except jwt.exceptions.InvalidSignatureError:
            continue
