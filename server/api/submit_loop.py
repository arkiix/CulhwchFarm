import logging.config
import importlib
import random
import time
from collections import defaultdict

import psycopg2

from models import Flag, FlagSubmit, Settings, ProtocolParam
import config


logger = None
conn_db = None


def get_settings() -> Settings:
    sq = '''select regex_flag_format, system_protocol_id, submit_flag_limit, submit_period, flag_lifetime, round_length
            from t_settings;'''

    cur = conn_db.cursor()
    cur.execute(sq)
    return Settings(*cur.fetchall()[0])


def get_queued_flags() -> list[Flag]:
    sq = '''select f.flag_id, f.flag
            from t_flags f
            left join t_flag_submits fs
                on f.flag_id = fs.flag_id
            where status_id is null
                or status_id = 0;'''

    cur = conn_db.cursor()
    cur.execute(sq)
    flags = cur.fetchall()
    cur.close()

    return [Flag(flag_id=flag[0], flag=flag[1]) for flag in flags]


def get_protocol_name(settings: Settings) -> str | None:
    sq = '''select protocol_name 
            from t_protocols tp 
            where protocol_id = %s;'''

    cur = conn_db.cursor()
    cur.execute(sq, (settings.system_protocol_id, ))
    res = cur.fetchall()

    if not res:
        return

    protocol_name = res[0][0]
    cur.close()

    return protocol_name


def get_protocols_params(settings) -> dict:
    sq = '''select protocol_param_id, protocol_id, protocol_param_name, protocol_param_value
            from t_protocols_params
            where protocol_id = %s;'''

    cur = conn_db.cursor()
    cur.execute(sq, (settings.system_protocol_id, ))
    protocols = list(map(lambda r: ProtocolParam(*r), cur.fetchall()))
    cur.close()

    return {
        p.protocol_param_name: p.protocol_param_value
        for p in protocols
    }


def get_fair_share(groups, limit):
    if not groups:
        return []

    groups = sorted(groups, key=len)
    places_left = limit
    group_count = len(groups)
    fair_share = places_left // group_count

    result = []
    residuals = []
    for group in groups:
        if len(group) <= fair_share:
            result += group

            places_left -= len(group)
            group_count -= 1
            if group_count > 0:
                fair_share = places_left // group_count
        else:
            selected = random.sample(group, fair_share + 1)
            result += selected[:-1]
            residuals.append(selected[-1])
    result += random.sample(residuals, min(limit - len(result), len(residuals)))

    random.shuffle(result)
    return result
    

def submit_flags(flags, protocol_name, protocol_params) -> list[FlagSubmit]:
    try:
        module = importlib.import_module('protocols.' + protocol_name.split('.')[0])
        return list(module.submit_flags(flags, protocol_params))

    except Exception as e:
        logger.exception(f'Error when working with sploit: {e}')


def connect_database():
    return psycopg2.connect(
        dbname=config.DB_DATABASE,
        user=config.DB_USER,
        password=config.DB_PASSWORD,
        host=config.DB_HOST
    )


def run_loop():
    global conn_db
    conn_db = connect_database()

    logger = logging.getLogger(__name__)
    logger.info('Submit loop started')

    while True:
        try:
            submit_start_time = time.time()

            settings = get_settings()

            sq = '''insert into t_flag_submits (flag_id, status_id, response)
                    select f.flag_id, 1, 'Flag expired'
                    from t_flags f
                    left join t_flag_submits fs
                        on f.flag_id = fs.flag_id
                    where create_dt < now() - interval '%s seconds' and fs.flag_id is null'''

            cur = conn_db.cursor()
            cur.execute(sq, (settings.flag_lifetime,))
            conn_db.commit()
            cur.close()

            if not settings.system_protocol_id:
                logger.info('Protocol not yet selected, skip submit iteration')
                time.sleep(3)
                continue

            queued_flags = get_queued_flags()

            if queued_flags:
                protocol_name = get_protocol_name(settings)
                protocol_params = get_protocols_params(settings)

                grouped_flags = defaultdict(list)
                for item in queued_flags:
                    grouped_flags[item.sploit_id, item.team_id].append(item)

                flags = get_fair_share(grouped_flags.values(), settings.submit_flag_limit)

                results: list[FlagSubmit] = submit_flags(flags, protocol_name, protocol_params)

                if results:
                    rows = map(
                        lambda fs: {
                            'flag': fs.flag,
                            'status_id': fs.status_id.value,
                            'response': fs.response
                        },
                        results
                    )

                    sq = '''insert into t_flag_submits as fs (status_id, response, flag_id)
                            values (%(status_id)s, %(response)s, (
                                select flag_id
                                from t_flags
                                where flag = %(flag)s
                            ))
                            on conflict(flag_id) do update
                            set status_id = %(status_id)s,
                                response = %(response)s
                            where fs.flag_id = (
                                select flag_id
                                from t_flags
                                where flag = %(flag)s
                            );'''

                    cur = conn_db.cursor()
                    cur.executemany(sq, rows)
                    conn_db.commit()
                    cur.close()

            submit_spent = time.time() - submit_start_time

            if settings.submit_period > submit_spent:
                time.sleep(settings.submit_period - submit_spent)

        except psycopg2.errors.InFailedSqlTransaction:
            logger.exception('FailedSqlTransaction. Rollback...')
            conn_db.rollback()
            time.sleep(3)

        except psycopg2.InterfaceError:
            logger.info('Reconnecting to the database')
            conn_db = connect_database()

        except Exception as e:
            logger.exception(f'Error in submit loop: {e}')
            time.sleep(3)
