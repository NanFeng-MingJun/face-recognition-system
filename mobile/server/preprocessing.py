import cv2
import numpy as np
from alignment import norm_crop


def preprocess(img, bbox, lmk, size=112):
    warped = norm_crop(img, landmark=lmk, image_size=size)
    if img.shape[0] != 112:
        img = cv2.resize(img, (112, 112), interpolation = cv2.INTER_AREA)
    img = np.transpose(img, axes=(2, 0, 1))

    return img, bbox
    