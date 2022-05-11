from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from controllers.RegisterController import RegisterController
from controllers.VerifyController import VerifyController


app = FastAPI()


# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(RegisterController.router)
app.include_router(VerifyController.router)