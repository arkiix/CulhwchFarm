from aiohttp import web

from config import SERVER_PASSWORD


async def get_client(request: web.Request):
    farm_url = request.rel_url.query.get('url')
    round_length = request.app['settings'].round_length

    print(f'{round_length=}')
    print(f'{SERVER_PASSWORD=}')
    print(f'{farm_url=}')

    with open('client_template.py', 'rb') as f:
        client_content = f.read()

    client_content = client_content.replace(b'{{server_url}}', farm_url.encode())
    client_content = client_content.replace(b'{{server_password}}', SERVER_PASSWORD.encode())
    client_content = client_content.replace(b'{{round_length}}', str(round_length).encode())

    return web.Response(
        body=client_content,
        content_type='text/x-python',
        headers={'Content-Disposition': 'attachment; filename=start_sploit.py'}
    )
