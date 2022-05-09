import sys
import os
import datetime
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
#from Database.DataHandler import EmbedHandler
from commons.Helper import load_onnx, get_embedding, preprocess

#db = EmbedHandler()
#table_name = 'cs101'
#model = load_onnx("E:\Bai tap\He_Thong_Diem_Danh_App\model.onnx")

class RegisterService:

    
    @classmethod
    def register(cls, message, model, db):
        #message [[https://pic.png],[18120506], school_a, class_1]
        try:
            model_loaded = load_onnx(model)
            img, bbox = preprocess(message[0][0], 112, 'centerface')
            emb = get_embedding(model_loaded, img)
            db.insert_vector([int(message[1][0])], emb, message[2], message[3])
            return {'result': True, 'bbox': list(bbox), 'time': datetime.datetime.now()}
        except:
            return {'result': False, 'bbox': [-1,-1,-1,-1], 'time': datetime.datetime.now()}
