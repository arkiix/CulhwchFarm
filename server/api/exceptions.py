class APIException(Exception):
    error_code = ''
    status_code = -1


class Unauthorized(APIException):
    error_code = 'Unauthorized'
    status_code = 401


class NotFound(APIException):
    error_code = 'NotFound'
    status_code = 404


class ServerError(APIException):
    error_code = 'ServerError'
    status_code = 500


class InvalidCredentials(APIException):
    error_code = 'InvalidCredentials'
    status_code = 401


class TeamExists(APIException):
    error_code = 'TeamExists'
    status_code = 409


class FlagExists(APIException):
    error_code = 'FlagExists'
    status_code = 409


class TooManyTeams(APIException):
    error_code = 'TooManyTeams'
    status_code = 400


class IpAddressInvalid(APIException):
    error_code = 'IpAddressInvalid'
    status_code = 400


class FlagsNotFound(APIException):
    error_code = 'FlagsNotFound'
    status_code = 400
