import sys
import os
import datetime
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from config.system_config import verify_threshold
from commons.Helper import load_onnx, get_embedding, preprocess


class VerifyService:

    
    @classmethod
    def verify(cls, message, model, db):
        #message [[https://pic.png],[18120506], school_a, class_1]
        try:
            model_loaded = load_onnx(model)
            img, bbox = preprocess(message[0][0], 112, 'centerface')
            emb = get_embedding(model_loaded, img)
            #print(emb)
            #print(type(emb))
            id, distance = db.search_by_id(message[1][0], emb, message[2], message[3])
        
            if id == int(message[1][0]) and distance < verify_threshold:
                return {'result': True, 'bbox': list(bbox), 'time': int(datetime.datetime.now().timestamp() * 1000)}
            else:
                return {'result': False, 'bbox': list(bbox), 'time': int(datetime.datetime.now().timestamp() * 1000)}
        except Exception as e:
            print(e)
            return {'result': False, 'bbox': [-1,-1,-1,-1], 'time': int(datetime.datetime.now().timestamp() * 1000)}