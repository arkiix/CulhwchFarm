# params: SYSTEM_URL, TEAM_TOKEN, TIMEOUT_QUERY
import requests

from models import FlagSubmit, FlagStatus, Flag


SUBMIT_HEADERS = {
    'accept': 'application/json',
    'Content-Type': 'application/json'
}


def check_system(url: str) -> tuple[bool, str]:
    r = requests.get(
        url + '/check',
        headers={'accept': 'application/json'}
    )
    response_status = r.json().get('status', 'bad').lower().strip()
    
    return response_status == 'ok', response_status
    

def submit_flags(flags: list[Flag], config):
    base_url = ''
    found_status = None
    
    if not config.get('SYSTEM_URL', None):
        found_status = FlagStatus.QUEUED
        protocol_response = 'Parameter SYSTEM_URL not set!'
        
    elif not config.get('TEAM_TOKEN', None):
        found_status = FlagStatus.QUEUED
        protocol_response = 'Parameter TEAM_TOKEN not set!'
    
    else:
        base_url = config.get('SYSTEM_URL').strip().strip('/')
    
        if 'http' not in base_url:
            base_url = 'http://' + base_url
        
        jury_ok, jury_status = check_system(base_url)
        
        if not jury_ok:
            found_status = FlagStatus.QUEUED
            protocol_response = f'System status is not ok, status: {jury_status}'

    if found_status is not None:
        return map(
            lambda f: FlagSubmit(f.flag_id, found_status, protocol_response),
            flags
        )
    
    data = {
        'flags': list(map(lambda f: f.flag, flags)),
        'token': config.get('TEAM_TOKEN')
    }

    r = requests.post(
        base_url + '/flag',
        headers=SUBMIT_HEADERS,
        json=data,
        timeout=int(config.get('TIMEOUT_QUERY', 30))
    )
    response_dict = r.json()

    for r in list(response_dict):
        flag = r.get('flag')
        response_success = r.get('success', None)
        response_system = r.get('error', 'No message')
        
        if response_success is None:
            found_status = FlagStatus.QUEUED
        else:
            found_status = FlagStatus.ACCEPTED if 'true' in response_success.lower() else FlagStatus.REJECTED

        yield FlagSubmit(flag, found_status, response_system)
        