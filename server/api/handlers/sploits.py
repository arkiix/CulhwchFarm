import asyncpg
from aiohttp import web

import models


async def get_sploits(request: models.WebRequest):
    pool = request.app['pool']

    sq = '''select sploit_id, sploit_name
            from t_sploits;'''

    async with pool.acquire() as conn:
        sploits = await conn.fetch(sq)

    return web.json_response(
        {
            'status': 'ok',
            'sploits': list(map(lambda t: dict(t), sploits))
        }
    )


async def init_sploit(request: models.WebRequest):
    sploit_name = (await request.json()).get('sploit_name')

    pool = request.app.get('pool')

    async with pool.acquire() as conn:
        try:
            sq = '''insert into t_sploits (sploit_name)
                    values ($1)
                    returning sploit_id;'''

            sploit_id = await conn.fetchval(sq, sploit_name)

        except asyncpg.connection.exceptions.UniqueViolationError:
            sq = '''select sploit_id
                    from t_sploits
                    where sploit_name = $1;'''

            sploit_id = await conn.fetchval(sq, sploit_name)

    return web.json_response(
        {
            'status': 'ok',
            'sploit_id': sploit_id
        }
    )
