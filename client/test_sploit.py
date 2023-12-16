#!/usr/bin/env python3
import string
import random


def gen_flag():
    return ''.join([random.choice(string.ascii_uppercase) for i in range(31)]) + '='


def generate_spam_flag():
    import base64, hashlib, os, re
    encode = lambda s: re.sub(r'[a-z/+=\n]', r'', base64.encodebytes(s).decode()).upper()
    secret = 'qh87eh8723h'

    prefix = encode(os.urandom(64))[:16]
    suffix = encode(hashlib.sha256((prefix + secret).encode()).digest())[:15]
    return prefix + suffix + '='


for _ in range(random.randint(0, 10)):
    print(gen_flag(), flush=True)

for _ in range(random.randint(0, 5)):
    print(generate_spam_flag(), flush=True)
