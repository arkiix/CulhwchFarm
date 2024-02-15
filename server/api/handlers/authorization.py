from aiohttp import web

import exceptions
import config


async def login(request: web.Request):
    user_data = await request.json()
    password = user_data.get('password')

    if not password == config.SERVER_PASSWORD:
        raise exceptions.InvalidCredentials

    return web.json_response(
        {
            'status': 'ok'
        }
    )
