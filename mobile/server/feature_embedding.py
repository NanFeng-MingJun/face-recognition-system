import numpy as np
import onnxruntime
from sklearn.preprocessing import normalize


def load_onnx(model):
  session = onnxruntime.InferenceSession(model, providers = ['CPUExecutionProvider']) #['TensorrtExecutionProvider', 'CUDAExecutionProvider', 'CPUExecutionProvider']
  return session


def get_embedding(model, img, embeding_size = 512):
  embeddings = np.zeros((1, embeding_size))

  input = model.get_inputs()[0]
  output = model.get_outputs()[0]

  img = img.astype(np.float32)
  img = ((img / 255) - 0.5) / 0.5
  img = np.expand_dims(img,axis=0)
  embeddings[0] = model.run([output.name], {input.name: img})[0]

  embeddings = normalize(embeddings)
  return embeddings