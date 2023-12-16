import logging

from aiohttp import web

import exceptions


def error_to_json(error) -> web.Response:
    data = {
        'status': 'error',
        'error_code': error.error_code
    }
    return web.json_response(data, status=error.status_code)


@web.middleware
async def error_middleware(request, handler):
    try:
        response = await handler(request)

        if response.status == 404:
            return error_to_json(exceptions.NotFound)
        return response

    except web.HTTPException as ex:
        if ex.status == 404:
            return error_to_json(exceptions.NotFound)
        raise

    except Exception as ex:
        logging.getLogger(__name__).exception('Error in API handler')
        return error_to_json(ex) if isinstance(ex, exceptions.APIException) else error_to_json(exceptions.ServerError)
