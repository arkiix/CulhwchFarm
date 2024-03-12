from aiohttp import web

from handlers import authorization, flags, teams, settings, sploits


async def healthcheck(_):
    return web.json_response({'status': 'ok'})


ROUTES = (
    web.route('get', '/api/healthcheck', healthcheck),

    web.route('post', '/api/auth/login', authorization.login),

    web.route('get', '/api/flags', flags.get_flags),
    web.route('post', '/api/flags', flags.submit_flags),
    web.route('delete', '/api/flags', flags.delete_flags),

    web.route('get', '/api/flags/get_info', flags.get_info),
    web.route('post', '/api/flags/manual', flags.manual_submit_flag),

    web.route('get', '/api/teams', teams.get_teams),
    web.route('post', '/api/teams', teams.add_team),
    web.route('delete', '/api/teams', teams.delete_teams),

    web.route('post', '/api/teams/gen', teams.generate_teams),

    web.route('get', '/api/settings', settings.get_settings),
    web.route('put', '/api/settings', settings.update_settings),

    web.route('get', '/api/settings/protocols', settings.get_protocols),
    web.route('get', '/api/settings/validators', settings.get_validators),
    web.route('get', '/api/settings/protocol/params', settings.get_protocols_params),

    web.route('get', '/api/sploits', sploits.get_sploits),
    web.route('post', '/api/sploits', sploits.init_sploit),
    web.route('delete', '/api/sploits', sploits.delete_sploits),
)
