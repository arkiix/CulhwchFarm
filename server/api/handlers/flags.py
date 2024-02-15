import importlib
import re

import asyncpg
from aiohttp import web

import exceptions
import models


DISPLAY_COLUMNS = ('flag', 'sploit_name', 'team_name', 'create_dt', 'status_name', 'response')


async def get_flags(request: web.Request):
    page_num = int(request.rel_url.query.get('page_num'))
    sploit_id = request.rel_url.query.get('sploit_id')

    sq = f'''select {", ".join(DISPLAY_COLUMNS)}
             from v_flags
             where ($2::int is not null and sploit_id = $2)
                or $2::int is null
             order by flag_id desc
             limit 100 offset $1;'''

    async with request.app['pool'].acquire() as conn:
        flags = await conn.fetch(sq, (page_num - 1) * 100, int(sploit_id) if sploit_id else None)

    return web.json_response(
        {
            'status': 'ok',
            'flags': list(map(lambda t: dict(t), flags))
        }
    )


async def manual_submit_flag(request: web.Request):  # Нужно встроить валидаторы
    user_data = await request.json()
    farm_settings = request.app.get('settings')

    flags = re.findall(farm_settings.regex_flag_format, user_data.get('flag'))

    if not flags:
        raise exceptions.FlagsNotFound

    sq = f'''insert into t_flags (flag, sploit_id, team_id)
             values ($1, -1, -1)
             returning flag_id;'''

    async with request.app['pool'].acquire() as conn:
        flags_id = []
        existing_flags = 0

        for flag in flags:
            try:
                flags_id.append(await conn.fetchval(sq, flag))
            except asyncpg.exceptions.UniqueViolationError:
                existing_flags += 1

        if existing_flags == len(flags):
            raise exceptions.FlagExists

        sq = f'''select {", ".join(DISPLAY_COLUMNS)}
                 from v_flags
                 where flag_id = any($1);'''

        flags = await conn.fetch(sq, flags_id)

    return web.json_response(
        {
            'status': 'ok',
            'flags': list(map(lambda t: dict(t), flags))
        }
    )


async def submit_flags(request: web.Request):
    flags = await request.json()

    if not flags:
        raise exceptions.FlagsNotFound

    flags = list(map(lambda f: models.Flag(**f), flags))

    validators = request.app['active_validators']

    for validator in validators:
        module = importlib.import_module('validators.' + validator.validator_name.split('.')[0])
        flags = [
            flag
            async for flag in module.validate_flags(flags, request.app, validator.validator_params)
        ]

    async with request.app['pool'].acquire() as conn:
        sq = '''insert into t_flags (flag, sploit_id, team_id)
                values ($1, $2, $3)
                on conflict do nothing;'''

        await conn.executemany(sq, map(lambda f: (f.flag, f.sploit_id, f.team_id), flags))

    return web.json_response(
        {
            'status': 'ok'
        }
    )


async def get_info(request: web.Request):
    count_rounds = int(request.rel_url.query.get('count_rounds'))

    sploit_id = request.rel_url.query.get('sploit_id')
    sploit_id = int(sploit_id) if sploit_id else None

    async with request.app['pool'].acquire() as conn:
        result_info = await conn.fetchval('select get_info_flags($1::int2);', sploit_id)

        result_info['rounds_info'] = await conn.fetchval(
            'select get_round_statistics($1::int2, $2, $3);',
            sploit_id,
            request.app['settings'].round_length,
            count_rounds
        )

    return web.json_response(
        {
            'status': 'ok',
            'info': result_info
        }
    )
