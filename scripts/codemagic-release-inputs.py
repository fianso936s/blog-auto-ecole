"""Fail before building if the release environment has not been provisioned.

Print names/status only; never disclose the Meta token.
"""
import os


def validate(env):
    if env.get('META_APP_ID') != '925152177347941':
        raise ValueError('META_APP_ID must identify Le Repere Permis')
    token = env.get('META_CLIENT_TOKEN', '')
    if len(token) <= 10 or '$(' in token:
        raise ValueError('META_CLIENT_TOKEN must be configured as a secret')
    number = env.get('REPERE_BUILD_NUMBER', '')
    if not number.isascii() or not number.isdecimal() or int(number) < 22:
        raise ValueError('REPERE_BUILD_NUMBER must be an unused integer >= 22')


if __name__ == '__main__':
    try:
        validate(os.environ)
    except ValueError as exc:
        raise SystemExit(str(exc))
    print('Release inputs present. Confirm this build number is unused in App Store Connect.')
