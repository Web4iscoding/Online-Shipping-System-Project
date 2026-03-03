from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed

from .models import DeviceToken


class DeviceTokenAuthentication(BaseAuthentication):
    """
    Token-based authentication that supports multiple tokens per user.
    Each login / device gets its own DeviceToken, so logging out on one
    device does not affect other sessions.

    Clients should authenticate by passing the token key in the
    "Authorization" HTTP header, prepended with the string "Token ".
    For example:  Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b
    """

    keyword = "Token"

    def authenticate(self, request):
        auth_header = request.META.get("HTTP_AUTHORIZATION", "").split()

        if not auth_header or auth_header[0] != self.keyword:
            return None

        if len(auth_header) != 2:
            raise AuthenticationFailed("Invalid token header. Token string should not contain spaces.")

        token_key = auth_header[1]

        try:
            token = DeviceToken.objects.select_related("user").get(key=token_key)
        except DeviceToken.DoesNotExist:
            raise AuthenticationFailed("Invalid token.")

        if not token.user.is_active:
            raise AuthenticationFailed("User inactive or deleted.")

        return (token.user, token)

    def authenticate_header(self, request):
        return self.keyword
