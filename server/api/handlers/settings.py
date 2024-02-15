import os
import logging
import hashlib
from itertools import chain

from aiohttp import web

from database import database


async def update_app_settings(app: web.Application):
    pool = app['pool']

    app['settings'] = await database.get_settings(pool)

    protocol_params = await database.get_protocols_params(
        pool,
        app['settings'].system_protocol_id
    )
    app['protocol_params'] = protocol_params
    app['protocol_config'] = {
        p.protocol_param_name: p.protocol_param_value
        for p in protocol_params
    }

    app['active_validators'] = await database.get_active_validators(pool)

    logging.getLogger(__name__).info('Settings updated successfully')


async def update_scripts(pool, *script_types):
    if not script_types:
        script_types = ('protocols', 'validators')

    for script_type in script_types:
        scripts = filter(lambda x: '.py' in x, os.listdir(script_type))

        scripts_dict = dict()

        for script_name in scripts:
            with open(f'{script_type}/{script_name}', 'r') as f:
                lines = f.readlines()

                for line in lines:
                    if line.startswith('#') and 'params:' in line:
                        params = list(map(lambda x: x.strip(), line.split(':')[1].split(',')))
                        break
                else:
                    params = []

            scripts_dict[script_name] = params

        async with pool.acquire() as conn:
            await conn.execute(f'select fn_init_{script_type}($1::jsonb);', scripts_dict)

    logging.getLogger(__name__).info(f'Scripts successfully updated ({", ".join(script_types)})')


def directory_hash(*directory_names: str) -> str:
    hasher = hashlib.new('sha256')

    files = chain(
        *map(
            lambda dn: map(lambda fn: f'{dn}/{fn}', os.listdir(dn)),
            directory_names
        )
    )

    for file in files:
        with open(file, 'rb') as f:
            hasher.update(f.read())

    return hasher.hexdigest()


async def get_settings(request: web.Request):
    farm_settings = request.app['settings']

    script_hash = directory_hash('protocols', 'validators')

    if script_hash != request.app['script_hash']:
        await update_scripts(request.app['pool'], 'protocols', 'validators')
        request.app['script_hash'] = script_hash

    return web.json_response(
        {
            'status': 'ok',
            'settings': farm_settings.__dict__ if farm_settings else dict()
        }
    )


async def get_protocols(request: web.Request):
    pool = request.app['pool']

    sq = '''select protocol_id, protocol_name
            from t_protocols;'''

    async with pool.acquire() as conn:
        protocols = await conn.fetch(sq)

    return web.json_response(
        {
            'status': 'ok',
            'protocols': list(map(lambda p: dict(p), protocols))
        }
    )


async def get_validators(request: web.Request):
    pool = request.app['pool']

    sq = '''select 
                v.validator_id, 
                v.validator_name,
                v.validator_is_active,
                coalesce(
                    jsonb_agg(to_jsonb(vp)) filter(where vp.validator_param_name is not null), 
                    '{}'::jsonb
                ) as validator_params
            from t_validators v
            left join t_validators_params vp
                on v.validator_id = vp.validator_id
            group by 1, 2, 3;'''

    async with pool.acquire() as conn:
        validators = await conn.fetch(sq)

    return web.json_response(
        {
            'status': 'ok',
            'validators': list(map(lambda v: dict(v), validators))
        }
    )


async def update_settings(request: web.Request):
    user_data = await request.json()

    pool = request.app['pool']
    settings = user_data.get('settings')
    protocol_param_values = user_data.get('protocol_param_values')
    validator_settings = user_data.get('validator_settings')

    columns = ('regex_flag_format', 'system_protocol_id', 'submit_flag_limit', 'submit_period', 'flag_lifetime',
               'round_length')
    params = ', '.join(f'{c} = ${n}' for n, c in enumerate(columns, 1))

    async with pool.acquire() as conn:
        sq = f'''update t_settings
                 set {params};'''
        await conn.execute(sq, *map(lambda c: settings.get(c), columns))

        sq = '''update t_protocols_params
                set protocol_param_value = $2
                where protocol_param_id = $1;'''
        await conn.executemany(sq, map(lambda param: (int(param[0]), param[1]), protocol_param_values.items()))

        sq = '''update t_validators
                set validator_is_active = $1
                where validator_id = $2;'''
        await conn.executemany(
            sq,
            map(lambda v: (v.get('validator_is_active'), v.get('validator_id')), validator_settings)
        )

        sq = '''update t_validators_params
                set validator_param_value = $1
                where validator_param_id = $2;'''
        await conn.executemany(
            sq,
            map(
                lambda p: (p.get('validator_param_value'), p.get('validator_param_id')),
                chain(*map(lambda v: v.get('validator_params'), validator_settings))
            )
        )

    await update_app_settings(request.app)

    return web.json_response(
        {
            'status': 'ok',
        }
    )


async def get_protocols_params(request: web.Request):
    protocol_id = int(request.rel_url.query.get('protocol_id'))

    pool = request.app['pool']
    protocols = await database.get_protocols_params(pool, protocol_id)

    return web.json_response(
        {
            'status': 'ok',
            'params': list(map(lambda p: p.__dict__, protocols)),
        }
    )
