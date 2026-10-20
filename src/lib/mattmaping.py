"""
Markmosaiqu - non-AI background removal engine (OpenCV).

Pipeline
  1. Seeded GrabCut: user rectangle (or auto inset) + optional Keep/Remove strokes
  2. Second GrabCut pass on a narrow band around the first result (cleaner edges)
  3. Cleanup: largest components, small-hole fill, light smoothing
  4. Edge-aware soft alpha with a guided filter (guide = the photo itself)
  5. Color decontamination: edge pixels take the color of the nearest sure-foreground pixel

Usage
    from matting_engine import cutout, composite_on
    rgba = cutout(bgr, rect=(x, y, w, h), fg_mask=None, bg_mask=None)
    white = composite_on(rgba, (255, 255, 255))

fg_mask / bg_mask: uint8 arrays, same size as the image, non-zero where the user painted.
"""
import cv2
import numpy as np
from scipy import ndimage as ndi


# ----------------------------------------------------------------------------
# helpers
# ----------------------------------------------------------------------------
def _guided_filter(guide: np.ndarray, src: np.ndarray, r: int, eps: float) -> np.ndarray:
    """Classic guided filter (He et al.) with a gray guide in [0,1]."""
    k = (2 * r + 1, 2 * r + 1)
    mean = lambda x: cv2.boxFilter(x, -1, k, normalize=True)
    mI, mp = mean(guide), mean(src)
    cov = mean(guide * src) - mI * mp
    var = mean(guide * guide) - mI * mI
    a = cov / (var + eps)
    b = mp - a * mI
    return mean(a) * guide + mean(b)


def _largest_components(mask: np.ndarray, min_ratio: float = 0.02) -> np.ndarray:
    n, lab, stats, _ = cv2.connectedComponentsWithStats(mask, connectivity=4)
    if n <= 1:
        return mask
    areas = stats[1:, cv2.CC_STAT_AREA]
    keep = np.where(areas >= areas.max() * min_ratio)[0] + 1
    return np.isin(lab, keep).astype(np.uint8)


def _fill_small_holes(mask: np.ndarray, max_ratio: float = 0.002) -> np.ndarray:
    inv = (mask == 0).astype(np.uint8)
    n, lab, stats, _ = cv2.connectedComponentsWithStats(inv, connectivity=4)
    out = mask.copy()
    limit = max_ratio * mask.size
    h, w = mask.shape
    for i in range(1, n):
        x, y, bw, bh, area = stats[i]
        touches_border = x == 0 or y == 0 or x + bw == w or y + bh == h
        if not touches_border and area < limit:
            out[lab == i] = 1
    return out


def _grabcut(img, mask, iters):
    bgd = np.zeros((1, 65), np.float64)
    fgd = np.zeros((1, 65), np.float64)
    cv2.grabCut(img, mask, None, bgd, fgd, iters, cv2.GC_INIT_WITH_MASK)
    return mask


# ----------------------------------------------------------------------------
# main entry
# ----------------------------------------------------------------------------
def cutout(
    bgr: np.ndarray,
    rect=None,            # (x, y, w, h) in image pixels; None = auto inset of 2%
    fg_mask=None,         # strokes: keep
    bg_mask=None,         # strokes: remove
    max_side: int = 800, # working resolution (GrabCut is O(pixels))
    iters: int = 6,
    feather: float = 1.0,
    refine: bool = True,
):
    H, W = bgr.shape[:2]
    s = min(1.0, max_side / max(H, W))
    img = cv2.resize(bgr, (round(W * s), round(H * s)), interpolation=cv2.INTER_AREA) if s < 1 else bgr.copy()
    h, w = img.shape[:2]

    def scale_mask(m):
        if m is None:
            return None
        m = (m > 0).astype(np.uint8)
        return cv2.resize(m, (w, h), interpolation=cv2.INTER_NEAREST) if s < 1 else m

    fg_s, bg_s = scale_mask(fg_mask), scale_mask(bg_mask)

    # ---- 1. initial GrabCut --------------------------------------------------
    if rect is None:
        m = int(round(min(h, w) * 0.02))
        rx, ry, rw, rh = m, m, w - 2 * m, h - 2 * m
    else:
        rx, ry, rw, rh = [int(round(v * s)) for v in rect]

    mask = np.full((h, w), cv2.GC_BGD, np.uint8)
    mask[ry:ry + rh, rx:rx + rw] = cv2.GC_PR_FGD
    if fg_s is not None:
        mask[fg_s > 0] = cv2.GC_FGD
    if bg_s is not None:
        mask[bg_s > 0] = cv2.GC_BGD
    mask = _grabcut(img, mask, iters)
    fg = ((mask == cv2.GC_FGD) | (mask == cv2.GC_PR_FGD)).astype(np.uint8)

    fg = _largest_components(fg)
    fg = _fill_small_holes(fg)

    # ---- 2. band re-run for cleaner edges -------------------------------------
    if refine:
        k = max(3, int(round(min(h, w) * 0.012)) | 1)
        ker = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (k, k))
        sure_fg = cv2.erode(fg, ker)
        sure_bg = 1 - cv2.dilate(fg, ker)
        m2 = np.full((h, w), cv2.GC_PR_BGD, np.uint8)
        m2[fg > 0] = cv2.GC_PR_FGD
        m2[sure_fg > 0] = cv2.GC_FGD
        m2[sure_bg > 0] = cv2.GC_BGD
        if fg_s is not None:
            m2[fg_s > 0] = cv2.GC_FGD
        if bg_s is not None:
            m2[bg_s > 0] = cv2.GC_BGD
        m2 = _grabcut(img, m2, 3)
        fg = ((m2 == cv2.GC_FGD) | (m2 == cv2.GC_PR_FGD)).astype(np.uint8)
        fg = _largest_components(fg)
        fg = _fill_small_holes(fg)

    # light smoothing of the binary mask (removes 1px jaggies)
    sm = cv2.GaussianBlur(fg.astype(np.float32), (0, 0), 1.2)
    fg = (sm > 0.5).astype(np.uint8)
    if fg_s is not None:
        fg[fg_s > 0] = 1
    if bg_s is not None:
        fg[bg_s > 0] = 0

    # ---- 3. soft alpha: guided filter on a narrow band ------------------------
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float32) / 255.0
    r = max(2, int(round(min(h, w) * 0.004)))
    alpha = _guided_filter(gray, fg.astype(np.float32), r=r, eps=1e-3)
    alpha = np.clip(alpha, 0, 1)
    # only trust the filter near the boundary; keep interior/exterior exact
    band_k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * r + 3, 2 * r + 3))
    inner = cv2.erode(fg, band_k)
    outer = cv2.dilate(fg, band_k)
    alpha = np.where(inner > 0, 1.0, np.where(outer == 0, 0.0, alpha))
    if feather > 0:
        alpha = cv2.GaussianBlur(alpha.astype(np.float32), (0, 0), feather * 0.6)
    # tighten the ramp so edges do not look blurry / haloed
    alpha = np.clip((alpha - 0.15) / 0.7, 0, 1)
    if fg_s is not None:
        alpha[fg_s > 0] = 1
    if bg_s is not None:
        alpha[bg_s > 0] = 0

    # ---- 4. color decontamination --------------------------------------------
    sure = (alpha > 0.98)
    sure = cv2.erode(sure.astype(np.uint8), np.ones((3, 3), np.uint8)) > 0
    if sure.any():
        idx = ndi.distance_transform_edt(~sure, return_distances=False, return_indices=True)
        near = img[idx[0], idx[1]]
        edge = (alpha < 0.98)
        colors = img.copy()
        colors[edge] = near[edge]
    else:
        colors = img

    out = np.dstack([colors, (alpha * 255).astype(np.uint8)])

    # back to original size
    if s < 1:
        out = cv2.resize(out, (W, H), interpolation=cv2.INTER_CUBIC)
    return out


def composite_on(rgba: np.ndarray, color=(255, 255, 255)) -> np.ndarray:
    a = rgba[..., 3:4].astype(np.float32) / 255.0
    bg = np.array(color[::-1], np.float32)  # RGB->BGR
    return (rgba[..., :3] * a + bg * (1 - a)).astype(np.uint8)


def crop_to_product(rgba: np.ndarray, pad: float = 0.0):
    ys, xs = np.where(rgba[..., 3] > 20)
    if len(xs) == 0:
        return rgba
    x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
    return rgba[y0:y1 + 1, x0:x1 + 1]