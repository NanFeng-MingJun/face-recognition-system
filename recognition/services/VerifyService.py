import sys
import os
import numpy as np
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
#from Database.DataHandler import EmbedHandler
from config.system_config import verify_threshold
from commons.Helper import load_onnx, get_embedding, preprocess

#db = EmbedHandler()
#table_name = 'cs101'
#model = load_onnx("E:\Bai tap\He_Thong_Diem_Danh_App\model.onnx")

class VerifyService:

    
    @classmethod
    def verify(cls, message, model, db):
        #message [[https://pic.png],[18120506], school_a, class_1]
        model_loaded = load_onnx(model)
        img = preprocess(message[0][0], 112, 'centerface')
        emb = get_embedding(model_loaded, img)
        #print(emb)
        #print(type(emb))
        id, distance = db.search_by_id(message[1][0], emb, message[2], message[3])
        
        if id == int(message[1][0]) and distance < verify_threshold:
            return True
        else:
            return False