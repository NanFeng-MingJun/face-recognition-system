import sys
import os
import datetime
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from config.system_config import verify_threshold
from commons.Helper import load_onnx, get_embedding, preprocess

class IdentifyService:

    
    @classmethod
    def identify(cls, message, model, db):
        #message [[https://pic.png], school_a, class_1]
        model_loaded = load_onnx(model)
        img, bbox = preprocess(message[0][0], 112, 'centerface')
        emb = get_embedding(model_loaded, img)
        #print(emb)
        #print(type(emb))
        id, distance = db.search(emb, message[1], message[2])
        
        if distance < verify_threshold:
            return {'identity': int(id), 'bbox': list(bbox), 'time': datetime.datetime.now()}
        else:
            return {'identity': -1, 'bbox': list(bbox), 'time': datetime.datetime.now()}