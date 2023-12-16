# params: SYSTEM_URL, SYSTEM_TOKEN, TIMEOUT_QUERY
import requests

from models import FlagSubmit, FlagStatus, Flag


RESPONSES = {
    FlagStatus.QUEUED: ['timeout', 'game not started', 'try again later', 'game over', 'is not up'],
    FlagStatus.ACCEPTED: ['accepted', 'congrat'],
    FlagStatus.REJECTED: ['bad', 'wrong', 'expired', 'unknown', 'your own',
                          'too old', 'not in database', 'already submitted', 'invalid flag', 'no such flag'],
}


def submit_flags(flags: list[Flag], config):
    r = requests.put(
        config.get('SYSTEM_URL'),
        headers={'X-Team-Token': config.get('SYSTEM_TOKEN')},
        json=[item.flag for item in flags],
        timeout=int(config.get('TIMEOUT_QUERY'))
    )

    for item in r.json():
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
