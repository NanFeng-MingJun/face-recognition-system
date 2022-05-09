import os
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

import cv2
import numpy as np
from numpy.linalg import norm
import onnxruntime 
import onnx 
import urllib.request
#import matplotlib.pyplot as plt
#import datetime
from sklearn.preprocessing import normalize

from Database.DataHandler import EmbedHandler
from FaceAlig.aligment import norm_crop
from FaceDetection.functions import detect_faces
from config.system_config import face_recogniton_model_path

# Register lfw
def get_path_label(image_dir):
    image_dir = os.path.expanduser(image_dir)
    ids = os.listdir(image_dir)
    ids.sort()
    paths = []
    labels = []
    result = []
    for i in ids:
        cur_dir = os.path.join(image_dir, i)
        fns = os.listdir(cur_dir)
        paths.append([os.path.join(cur_dir, fn) for fn in fns])
        labels.append([i] * len(fns))
        result.append([[os.path.join(cur_dir, fn) for fn in fns], [i] * len(fns), 'HCMUS', 'cs101'])
        #yield [os.path.join(cur_dir, fn) for fn in fns], [i] * len(fns)
    return result

# Register
def get_path_label_2(image_dir):
    image_dir = os.path.expanduser(image_dir)
    ids = os.listdir(image_dir)
    ids.sort()
    paths = []
    labels = []
    for i in ids:
        cur_dir = os.path.join(image_dir, i)
        paths.append([cur_dir])
        labels.append(i.split('.')[0])
    return paths, labels


def get_path(image_dir):
    image_dir = os.path.expanduser(image_dir)
    ids = os.listdir(image_dir)
    ids.sort()
    paths = []
    for i in ids:
        cur_dir = os.path.join(image_dir, i)
        #print(i.split('.')[0])
        paths.append([cur_dir])
    return paths


def get_norm_crop(img_path, size = 112, detector_backend = "mtcnn"):
    #im = cv2.imread(img_path)
    #im = cv2.cvtColor(im, cv2.COLOR_BGR2RGB)
    
    im = get_image_url(img_path)
    im = cv2.cvtColor(im, cv2.COLOR_BGR2RGB)

    if detector_backend == "skip":
      return im

    bbox, landmark = detect_faces(im)
    
    if bbox is None:
      print("Can not detect face: ", img_path)
      return im, [-1,-1,-1,-1]

    nrof_faces = bbox.shape[0]
    bindex = 0
    
    if nrof_faces > 1:
      det = bbox[:, 0:4]
      img_size = np.asarray(im.shape)[0:2]
      bounding_box_size = (det[:, 2] - det[:, 0]) * (det[:, 3] - det[:, 1])
      img_center = img_size / 2
      offsets = np.vstack([(det[:, 0] + det[:, 2]) / 2 - img_center[1], (det[:, 1] + det[:, 3]) / 2 - img_center[0]])
      offset_dist_squared = np.sum(np.power(offsets, 2.0), 0)
      bindex = np.argmax(bounding_box_size - offset_dist_squared * 2.0)  # some extra weight on the centering
      
    _bbox = bbox[bindex, 0:4]
    _landmark = landmark[bindex]
    warped = norm_crop(im, landmark=_landmark, image_size=size)
    return warped, _bbox

def preprocess(img_path, size=112, detector_backend = "mtcnn"):

  img, bbox = get_norm_crop(img_path, size, detector_backend)
  if img.shape[0] != 112:
    img = cv2.resize(img, (112, 112), interpolation = cv2.INTER_AREA)
  img = np.transpose(img, axes=(2, 0, 1))

  return img, bbox


def get_embedding(model, img, embeding_size = 512):

  #time_consumed = 0.0
  embeddings = np.zeros((1, embeding_size))

  input = model.get_inputs()[0]
  output = model.get_outputs()[0]
  #time0 = datetime.datetime.now()

  img = img.astype(np.float32)
  img = ((img / 255) - 0.5) / 0.5
  img = np.expand_dims(img,axis=0)
  embeddings[0] = model.run([output.name], {input.name: img})[0]

  #time_now = datetime.datetime.now()
  #diff = time_now - time0
  #time_consumed += diff.total_seconds()

  embeddings = normalize(embeddings)
  #print(embeddings.shape)
  #print('infer time', time_consumed)
  return embeddings


def findCosineDistance(embeddings1, embeddings2):
  return 1 - np.dot(embeddings1, embeddings2) / (norm(embeddings1) * norm(embeddings2))
  

def findEuclideanDistance(embeddings1, embeddings2):
    diff = np.subtract(embeddings1, embeddings2)
    dist = np.sum(np.square(diff), 1)
    return dist



def load_onnx(model):
  # Run the model on the backend
  #model = onnx.load(model_path)
  #model = model.SerializeToString()
  session = onnxruntime.InferenceSession(model, providers = ['CPUExecutionProvider']) #['TensorrtExecutionProvider', 'CUDAExecutionProvider', 'CPUExecutionProvider']

  return session


def run_onnx(session, input_tensor):
  # get the name of the first input of the model

  input = session.get_inputs() 

  #output = session.get_outputs()
  #print('Input:', input[0])
  #print('Input Name:', input[0].name)
  #print('Output:', output[0])
  #print('Output Name:', output[0].name)

  outputs = session.run([], {input[0].name: input_tensor})[0]

  return np.array(outputs)


def get_image_url(url):
  req = urllib.request.urlopen(url)
  arr = np.asarray(bytearray(req.read()), dtype=np.uint8)
  img = cv2.imdecode(arr, -1) # 'Load it as it is'
  
  return img


#img = get_norm_crop("E:\Downloads\lfw_funneled\Aaron_Sorkin\Aaron_Sorkin_0001.jpg", size = 112, detector_backend = "centerface")
#print(type(img[0][0][0]))
#plt.title("Image shape {}".format(img.shape))
#plt.imshow(img)
#plt.show()


#img = preprocess("E:\Downloads\lfw_funneled\Aaron_Sorkin\Aaron_Sorkin_0001.jpg", size = 112, detector_backend = "centerface")
#print(img.shape)
#plt.title("Image shape {}".format(img.shape))
#plt.imshow(img)
#plt.show()

#model_proto = onnx.load(face_recogniton_model_path)
#model_serialize = model_proto.SerializeToString()
#model = load_onnx(model_serialize)
#img = np.zeros((3,112,112))
#emb = get_embedding(model, img)
#print(emb)
#a = EmbedHandler()
#a.load_all_collection()
#print(a.search_by_id(18120506,np.expand_dims(emb,axis=0),"HCMUS","cs101"))

#path, label = get_path_label_2("E:\Bai tap\He_Thong_Diem_Danh_Demo\call-normal")
#print(path)
#print(label)

#img = get_image_url('https://image.thanhnien.vn/w2048/Uploaded/2022/mftum/2022_04_27/dam-vinh-hung-ly-hon-9854.png')
#img = cv2.imread('E:\\Bai tap\\He_Thong_Diem_Danh_Demo\\input_folder\\18120506\\18120506_01.png')
#img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
#plt.imshow(img)
#plt.show()