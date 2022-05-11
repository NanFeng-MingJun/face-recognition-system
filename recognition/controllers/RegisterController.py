import sys
import os
from datetime import datetime
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from typing import List
from fastapi.params import Depends
from fastapi import APIRouter
from pydantic import BaseModel

from services.RegisterService import RegisterService
from config.db_config import get_db, get_model
from commons.Dependencies import get_organization

class RegisterFace(BaseModel):
    url: str
    label: str
    deparment: str
    
    
class RegisterResult(BaseModel):
    result: bool
    bbox: list
    time: datetime
    

class RegisterController:
    router = APIRouter()

    @staticmethod
    @router.post("/register", response_model=RegisterResult)
    def register(payload: RegisterFace, organization = Depends(get_organization), model = Depends(get_model), db = Depends(get_db)):
        
        #tmp = [[payload.url],[payload.label], organization, payload.deparment] 
        tmp = [['https://image.thanhnien.vn/w2048/Uploaded/2022/mftum/2022_04_27/dam-vinh-hung-ly-hon-9854.png'],[18120506], 'school_a', 'class_1']
        
        return RegisterService.register(tmp,model,db)


    