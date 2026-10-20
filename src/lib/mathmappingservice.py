"""
Thin HTTP wrapper so the Node/TS app can call the engine.   (NOT tested here: fastapi was not installed in my sandbox)

    pip install fastapi uvicorn python-multipart opencv-python-headless numpy scipy
    uvicorn matting_service:app --port 8001

POST /cutout  multipart form:
    image   : file (jpg/png/webp)
    rect    : "x,y,w,h"  (optional, pixels of the ORIGINAL image)
    fg      : PNG file, any non-transparent/non-black pixel = keep   (optional)
    bg      : PNG file, any non-transparent/non-black pixel = remove (optional)
returns: PNG with alpha. Run it in a queue/worker: ~3-6 s per image on 1 CPU core.
"""
import cv2, numpy as np
from fastapi import FastAPI, File, Form, UploadFile
from fastapi.responses import Response
from matting_engine import cutout

app = FastAPI()


def _decode(data: bytes, flags=cv2.IMREAD_COLOR):
    return cv2.imdecode(np.frombuffer(data, np.uint8), flags)


def _stroke_mask(data: bytes, shape):
    img = _decode(data, cv2.IMREAD_UNCHANGED)
    if img is None:
        return None
    if img.ndim == 3 and img.shape[2] == 4:
        m = img[..., 3] > 50
    else:
        m = (img if img.ndim == 2 else img.max(axis=2)) > 50
    m = m.astype(np.uint8) * 255
    return cv2.resize(m, (shape[1], shape[0]), interpolation=cv2.INTER_NEAREST)


@app.post("/cutout")
async def cutout_endpoint(
    image: UploadFile = File(...),
    rect: str = Form(None),
    fg: UploadFile = File(None),
    bg: UploadFile = File(None),
):
    img = _decode(await image.read())
    r = tuple(int(v) for v in rect.split(",")) if rect else None
    fgm = _stroke_mask(await fg.read(), img.shape[:2]) if fg else None
    bgm = _stroke_mask(await bg.read(), img.shape[:2]) if bg else None
    out = cutout(img, rect=r, fg_mask=fgm, bg_mask=bgm)
    ok, png = cv2.imencode(".png", out)
    return Response(content=png.tobytes(), media_type="image/png")