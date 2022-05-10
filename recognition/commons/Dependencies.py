import base64
import json
import re
from fastapi import Request
from fastapi.exceptions import HTTPException

jwt_regex = '^[^\.]+\.[^\.]+\.[^\.]+$'

def get_organization(request: Request):
    authorization = request.headers.get('authorization')
    
    token = authorization.split(' ')[1]
    if not re.search(jwt_regex, token):
        raise HTTPException(status_code=401)
    
    payload_str = token.split('.')[1]
    
    try:
        payload_json = base64.b64decode(payload_str + '==').decode('utf-8')
        payload = json.loads(payload_json)
        organization = str(payload.get('organization'))
    except:
        raise HTTPException(status_code=401)
    
    return organization