import sys
import os
from datetime import datetime
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from fastapi.params import Depends
from fastapi import APIRouter
from pydantic import BaseModel


from services.IdentifyService import IdentifyService
from config.db_config import get_db, get_model

class IdentityFace(BaseModel):
    url: str
    organization: str
    deparment: str
    
    
class IdentityResult(BaseModel):
    identity: str
    bbox: list
    time: datetime
    

class IdentityController:
    router = APIRouter()

    @staticmethod
    @router.post("/identity", response_model=IdentityResult)
    def register(payload: IdentityFace, model = Depends(get_model), db = Depends(get_db)):
        
        #tmp = [[payload.url], payload.organization, payload.deparment] 
        tmp = [['https://image.thanhnien.vn/w2048/Uploaded/2022/mftum/2022_04_27/dam-vinh-hung-ly-hon-9854.png'], 'HCMUS', 'cs101']
        return IdentifyService.identify(tmp,model,db)