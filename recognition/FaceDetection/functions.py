import numpy as np
import os
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from FaceDetection.FaceDetector import CenterFace


def detect_faces(img):
    h, w = img.shape[:2]
    centerface = CenterFace(landmarks=True)
    dets, lms = centerface(img, h, w, threshold=0.35)

    nface = len(dets)
    if nface == 0:
      return None, None

    bounding_box = np.empty((nface, 4))
    lmk = np.empty((nface, 5, 2))
    for i in range(nface):
      bounding_box[i] = dets[i][:4]
      lmk[i]  = np.array(lms[i]).reshape((5,2))

    return bounding_box, lmk


