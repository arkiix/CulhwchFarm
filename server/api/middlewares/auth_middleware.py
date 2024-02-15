from aiohttp import web

import exceptions
import config


NO_AUTH_ROUTES = ('/api/auth/login', '/api/healthcheck')  # Reducing the chance of forgetting to check authorization


@web.middleware
async def auth_middleware(request: web.Request, handler):
    user_password = request.headers.get('Authorization')

    if request.rel_url.path not in NO_AUTH_ROUTES and not user_password:
        raise exceptions.Unauthorized

    if user_password and user_password != config.SERVER_PASSWORD:
        raise exceptions.InvalidCredentials

    return await handler(request)
