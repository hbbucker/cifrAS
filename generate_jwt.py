import jwt
import time

with open("codebase/src/main/resources/privateKey.pem", "rb") as f:
    private_key = f.read()

payload = {
    "iss": "https://test.cifras.com",
    "sub": "e2e-user-1234",
    "upn": "e2e-user-1234",
    "groups": ["user", "authenticated"],
    "aud": "authenticated",
    "exp": int(time.time()) + 3600 * 24 * 365 * 10,
    "iat": int(time.time())
}

token = jwt.encode(payload, private_key, algorithm="RS256")
print(token)
