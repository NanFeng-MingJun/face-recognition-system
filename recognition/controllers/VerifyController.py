import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from typing import Optional
from fastapi.params import Depends
from fastapi import APIRouter
from pydantic import BaseModel


from services.VerifyService import VerifyService
from config.db_config import get_db, get_model
from commons.Dependencies import get_organization

class VerifyFace(BaseModel):
    url: str
    label: str
    deparment: Optional[str] = '_default'
    
    
class VerifyResult(BaseModel):
    result: bool
    bbox: list
    time: int
    
class VerifyController:
    router = APIRouter()

    @staticmethod
    @router.post("/verify", response_model=VerifyResult)
    def verify(payload: VerifyFace, organization = Depends(get_organization), model = Depends(get_model), db = Depends(get_db)):
        
        payload_dict = payload.dict()
        deparment = payload_dict.get('deparment')
        
        if not deparment:
            deparment = '_default'

        f = open("/tmp/verifyLog.txt", "a")
        f.write(payload.label + " " + payload.url + "\n")
        f.close()
        
        tmp = [[payload.url],[payload.label], organization, payload.deparment] 
        #tmp = [['https://image.thanhnien.vn/w2048/Uploaded/2022/mftum/2022_04_27/dam-vinh-hung-ly-hon-9854.png'],[18120506], 'HCMUS', 'cs101']
        return VerifyService.verify(tmp,model,db)