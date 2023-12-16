# params: SYSTEM_HOST, SYSTEM_PORT, TEAM_TOKEN
import socket

from models import FlagSubmit, FlagStatus, Flag


RESPONSES = {
    FlagStatus.QUEUED: ['timeout', 'game not started', 'try again later', 'game over', 'is not up'],
    FlagStatus.ACCEPTED: ['accepted', 'congrat'],
    FlagStatus.REJECTED: ['bad', 'wrong', 'expired', 'unknown', 'your own',
                          'too old', 'not in database', 'already submitted', 'invalid flag', 'no such flag',
                          'self', 'invalid', 'already_submitted', 'team_not_found', 'too_old', 'stolen'],
}

READ_TIMEOUT = 5
APPEND_TIMEOUT = 0.05
BUFSIZE = 4096


def recvall(sock):
    sock.settimeout(READ_TIMEOUT)
    chunks = [sock.recv(BUFSIZE)]

    sock.settimeout(APPEND_TIMEOUT)
    while True:
        try:
            chunk = sock.recv(BUFSIZE)
            if not chunk:
                break

            chunks.append(chunk)
        except socket.timeout:
            break

    sock.settimeout(READ_TIMEOUT)
    return b''.join(chunks)


def submit_flags(flags: list[Flag], config):
    sock = socket.create_connection((config.get('SYSTEM_HOST'), int(config.get('SYSTEM_PORT'))),
                                    READ_TIMEOUT)

    greeting = recvall(sock)

    if b'Welcome' not in greeting:
        raise Exception('Checksystem does not greet us: {}'.format(greeting))

    sock.sendall(config.get('TEAM_TOKEN').encode() + b'\n')
    invite = recvall(sock)

    if b'enter your flags' not in invite:
        raise Exception('Team token seems to be invalid: {}'.format(invite))

    for item in flags:
        sock.sendall(item.flag.encode() + b'\n')
        response = recvall(sock).decode().strip()

        if response:
            response = response.splitlines()[0]

        response = response.replace('[{}] '.format(item.flag), '')
        response_lower = response.lower()

        for status, substrings in RESPONSES.items():
            if any(s in response_lower for s in substrings):
                found_status = status
                break
        else:
            found_status = FlagStatus.QUEUED

        yield FlagSubmit(item.flag, found_status, response)

    sock.close()
