import logging
import json

import asyncpg

import models
import config


logger = logging.getLogger(__name__)


async def create_pool() -> asyncpg.Pool:
    async def init_connection(conn):
        await conn.set_type_codec(
            'jsonb',
            encoder=json.dumps,
            decoder=json.loads,
            schema='pg_catalog'
        )

    pool = await asyncpg.create_pool(
        host=config.DB_HOST,
        database=config.DB_DATABASE,
        user=config.DB_USER,
        password=config.DB_PASSWORD,
        init=init_connection
    )

    logging.info('Pool successfully created')

    try:
        await init_objects(pool)
        logging.info('Successfully executed DDL script for database initialization')
    except asyncpg.exceptions.DuplicateTableError:
        pass

    return pool


async def init_objects(pool) -> None:
    async with pool.acquire() as conn:
        sqs = []
        for file in ('tables', 'views', 'functions'):
            with open(f'database/{file}.sql', 'r') as f:
                sqs.append(f.read())

        await conn.execute('\n\n'.join(sqs))


async def get_settings(pool) -> models.Settings:
    sq = '''select regex_flag_format, system_protocol_id, submit_flag_limit, submit_period, flag_lifetime, round_length
            from t_settings;'''

    async with pool.acquire() as conn:
        return models.Settings(*await conn.fetchrow(sq))


async def get_protocols_params(pool, protocol_id) -> list[models.ProtocolParam]:
    sq = '''select protocol_param_id, protocol_id, protocol_param_name, protocol_param_value
            from t_protocols_params
            where protocol_id = $1;'''

    async with pool.acquire() as conn:
        return list(map(lambda r: models.ProtocolParam(*r), await conn.fetch(sq, protocol_id)))


async def get_active_validators(pool) -> list[models.Validator]:
    sq = '''select 
                v.validator_id, 
                v.validator_name,
                coalesce(
                    jsonb_object_agg(vp.validator_param_name, vp.validator_param_value)
                        filter(where vp.validator_param_name is not null),
                    '{}'::jsonb
                ) as validator_params
            from t_validators v
            left join t_validators_params vp
                on v.validator_id = vp.validator_id
            where v.validator_is_active is true
            group by 1, 2;'''

    async with pool.acquire() as conn:
        return list(map(lambda r: models.Validator(*r), await conn.fetch(sq)))
