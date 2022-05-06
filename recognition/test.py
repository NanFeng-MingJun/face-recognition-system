from commons.Helper import get_path_label
from services.RegisterService import RegisterService
import onnx 
from config.system_config import face_recogniton_model_path
from Database.DataHandler import EmbedHandler

model = onnx.load(face_recogniton_model_path)
model_serialized = model.SerializeToString()

db = EmbedHandler()
db.load_all_collection()

message = get_path_label('E:\Bai tap\He_Thong_Diem_Danh_Demo\input_folder')   
for i in message:
    print(i)
    RegisterService.register(i,model_serialized,db)