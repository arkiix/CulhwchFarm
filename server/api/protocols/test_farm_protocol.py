# params: ACCEPTED, QUEUED, REJECTED
import random

from models import FlagSubmit, FlagStatus, Flag


def submit_flags(flags: list[Flag], config):
    accepted_cnt = int(config.get('ACCEPTED'))
    queued_cnt = int(config.get('QUEUED'))
    rejected_cnt = int(config.get('REJECTED'))

    answers = [FlagStatus.ACCEPTED] * accepted_cnt + [FlagStatus.QUEUED] * queued_cnt + \
              [FlagStatus.REJECTED] * rejected_cnt

    for flag in flags:
        answer = random.choice(answers)
        yield FlagSubmit(flag.flag, answer, str(answer))
