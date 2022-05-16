import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from typing import Optional
from fastapi.params import Depends
from fastapi import APIRouter
from pydantic import BaseModel, validator

from services.RegisterService import RegisterService
from config.db_config import get_db, get_model
from commons.Dependencies import get_organization

class RegisterFace(BaseModel):
    url: str
    label: str
    deparment: Optional[list]
    
    class Config:
        validate_assignment = True

    @validator('deparment')
    def set_deparment(cls, deparment):
        if not deparment:
            return ['_default']
        else:
            return deparment
    
    
class RegisterResult(BaseModel):
    result: bool
    bbox: list
    time: int
    

class RegisterController:
    router = APIRouter()

    @staticmethod
    @router.post("/register", response_model=RegisterResult)
    def register(payload: RegisterFace, organization = Depends(get_organization), model = Depends(get_model), db = Depends(get_db)):
        
        payload_dict = payload.dict()
        deparment_list = payload_dict.get('deparment')
        
        if not deparment_list:
            deparment_list = ['_default']
            
             
        tmp = [[payload.url], [payload.label], organization, deparment_list] 
        #tmp = [['https://image.thanhnien.vn/w2048/Uploaded/2022/mftum/2022_04_27/dam-vinh-hung-ly-hon-9854.png'],[18120506], 'school_a', ['class_1', 'class_2']]
        
        return RegisterService.register(tmp,model,db)