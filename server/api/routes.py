from aiohttp import web

from handlers import authorization, flags, teams, settings, sploits


async def healthcheck(_):
    return web.json_response({'status': 'ok'})


ROUTES = (
    web.route('get', f'/api/healthcheck', healthcheck),

    web.route('post', f'/api/auth/login', authorization.login),

    web.route('get', f'/api/flags', flags.get_flags),
    web.route('post', f'/api/flags', flags.submit_flags),
    web.route('get', f'/api/flags/get_info', flags.get_info),
    web.route('post', f'/api/flags/manual', flags.manual_submit_flag),

    web.route('get', f'/api/teams', teams.get_teams),
    web.route('delete', f'/api/teams', teams.delete_teams),
    web.route('post', f'/api/teams', teams.add_team),
    web.route('post', f'/api/teams/gen', teams.generate_teams),

    web.route('get', f'/api/settings', settings.get_settings),
    web.route('get', f'/api/settings/protocols', settings.get_protocols),
    web.route('get', f'/api/settings/validators', settings.get_validators),
    web.route('get', f'/api/settings/protocol/params', settings.get_protocols_params),
    web.route('put', f'/api/settings', settings.update_settings),

    web.route('get', f'/api/sploits', sploits.get_sploits),
    web.route('post', f'/api/sploits', sploits.init_sploit),
)
