from typing import List
from fastapi import FastAPI
import numpy as np
from pydantic import BaseModel

from feature_embedding import get_embedding, load_onnx
from preprocessing import preprocess
import cv2

class Payload(BaseModel):
    bbox: object
    lmk: object
    im: object


app = FastAPI()

@app.post("/get-embedding")
def read_root(payload: Payload):
    model = load_onnx("./model.onnx")
    frame = np.array(payload.im).reshape((480//4, 640//4, 3))
    print(frame.shape)
    cv2.imshow("test", frame)
    img, bbox = preprocess(frame, payload.bbox, np.array(payload.lmk).reshape(5, 2))
    emb = get_embedding(model, img)
    return {"emb": emb.tolist()}
