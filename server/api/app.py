import logging.config
import asyncio
import threading

from aiohttp import web

import submit_loop
from routes import ROUTES
from database import database
from handlers.settings import update_app_settings, directory_hash, update_scripts
from middlewares.auth_middleware import auth_middleware
from middlewares.error_middleware import error_middleware


logging.config.fileConfig('logging.conf')
logger = logging.getLogger(__name__)


async def start(app: web.Application) -> None:
    pool = await database.create_pool()
    app['pool'] = pool

    app['script_hash'] = directory_hash('protocols', 'validators')
    await update_scripts(pool, 'protocols', 'validators')

    await update_app_settings(app)

    runner = web.AppRunner(app)
    await runner.setup()

    site = web.TCPSite(runner, host='0.0.0.0', port=3000)
    await site.start()
    logger.info('CulhwchFarm API started')


if __name__ == '__main__':
    app = web.Application(middlewares=[error_middleware, auth_middleware])
    app.add_routes(ROUTES)

    loop = asyncio.new_event_loop()

    loop.run_until_complete(start(app))

    threading.Thread(target=submit_loop.run_loop, daemon=True).start()

    loop.run_forever()
