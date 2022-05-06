import sys
import os
import onnx 
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from config.system_config import face_recogniton_model_path
from Database.DataHandler import EmbedHandler

model = onnx.load(face_recogniton_model_path)
model_serialized = model.SerializeToString()

print("Run db config")
db = EmbedHandler()
db.load_all_collection()

def get_db():
    yield db
    
def get_model():
    yield model_serialized
