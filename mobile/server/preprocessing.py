import cv2
import numpy as np
from alignment import norm_crop


def preprocess(img, bbox, lmk, size=112):
    warped = norm_crop(img, landmark=lmk, image_size=size)
    if warped.shape[0] != 112:
        warped = cv2.resize(warped, (112, 112), interpolation = cv2.INTER_AREA)

    warped = np.transpose(warped, axes=(2, 0, 1))
    return warped, bbox
    
