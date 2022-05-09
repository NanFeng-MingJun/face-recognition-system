import sys
import os
from datetime import datetime
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from fastapi.params import Depends
from fastapi import APIRouter
from pydantic import BaseModel


from services.VerifyService import VerifyService
from config.db_config import get_db, get_model

class VerifyFace(BaseModel):
    url: str
    label: str
    organization: str
    deparment: str
    
    
class VerifyResult(BaseModel):
    result: bool
    bbox: list
    time: datetime
    

class VerifyController:
    router = APIRouter()

    @staticmethod
    @router.post("/verify", response_model=VerifyResult)
    def register(payload: VerifyFace, model = Depends(get_model), db = Depends(get_db)):
        
        #tmp = [[payload.url],[payload.label], payload.organization, payload.deparment] 
        tmp = [['https://image.thanhnien.vn/w2048/Uploaded/2022/mftum/2022_04_27/dam-vinh-hung-ly-hon-9854.png'],[18120506], 'HCMUS', 'cs101']
        return VerifyService.verify(tmp,model,db)