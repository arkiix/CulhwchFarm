# params: SYSTEM_URL, SYSTEM_TOKEN, TIMEOUT_QUERY
import requests

from models import FlagSubmit, FlagStatus, Flag


RESPONSES = {
    FlagStatus.QUEUED: ['timeout', 'game not started', 'try again later', 'game over', 'is not up'],
    FlagStatus.ACCEPTED: ['accepted', 'congrat'],
    FlagStatus.REJECTED: ['bad', 'wrong', 'expired', 'unknown', 'your own',
                          'too old', 'not in database', 'already submitted', 'invalid flag', 'no such flag'],
}


def protocol_error(flags: list[Flag], error: str):
    for flag in flags:
        yield FlagSubmit(flag.flag, FlagStatus.QUEUED, error)


def submit_flags(flags: list[Flag], config):
    system_url = config.get('SYSTEM_URL', None)
    system_token = config.get('SYSTEM_TOKEN', None)
    timeout_query = config.get('TIMEOUT_QUERY', 5)

    if not system_url:
        return protocol_error(flags, '[Settings] System url not set')

    if not system_token:
        return protocol_error(flags, '[Settings] System token not set')

    system_url = system_url.strip()
    if 'http://' not in system_url and 'https://' not in system_url:
        system_url = 'http://' + system_url

    system_token = system_token.strip()

    r = requests.put(
        system_url,
        headers={'X-Team-Token': system_token},
        json=[flag.flag for flag in flags],
        timeout=int(timeout_query)
    )

    response = r.json()

    str_error = response.get('error', None)
    if str_error is not None:
        return protocol_error(flags, str_error)

    for item in response:
        response = item['msg'].strip()
        response = response.replace('[{}] '.format(item['flag']), '')

        response_lower = response.lower()

        for status, substrings in RESPONSES.items():
            if any(s in response_lower for s in substrings):
                found_status = status
                break
        else:
            found_status = FlagStatus.QUEUED

        yield FlagSubmit(item['flag'], found_status, response)
