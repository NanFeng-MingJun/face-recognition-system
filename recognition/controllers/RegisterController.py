import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from typing import List
from fastapi.params import Depends
from fastapi import APIRouter, Request
from pydantic import BaseModel

from services.RegisterService import RegisterService
from config.db_config import get_db, get_model

class RegisterFace(BaseModel):
    url: str
    label: str
    organization: str
    deparment: str

class RegisterController:
    router = APIRouter()

    @staticmethod
    @router.post("/register")
    def register(payload: RegisterFace, model = Depends(get_model), db = Depends(get_db)):
        
        #tmp = [[payload.url],[payload.label], payload.organization, payload.deparment] 
        tmp = [['https://image.thanhnien.vn/w2048/Uploaded/2022/mftum/2022_04_27/dam-vinh-hung-ly-hon-9854.png'],[18120506], 'school_a', 'class_1']
        return RegisterService.register(tmp,model,db)


    