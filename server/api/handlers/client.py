from aiohttp import web

from config import SERVER_PASSWORD


async def get_client(request: web.Request):
    params = {
        'server_url': request.rel_url.query.get('url'),
        'server_password': SERVER_PASSWORD,
        'round_length': str(request.app['settings'].round_length)
    }

    with open('client_template.py', 'rb') as f:
        client_content = f.read()

    for param_name, param_value in params.items():
        client_content = client_content.replace(('{{' + param_name + '}}').encode(), param_value.encode())

    return web.Response(
        body=client_content,
        content_type='text/x-python',
        headers={'Content-Disposition': 'attachment; filename=start_sploit.py'}
    )
