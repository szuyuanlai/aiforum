export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png"];
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export type ImageResult = { ok: true; dataUrl: string } | { ok: false; error: string };

/**
 * 讀取使用者選擇的 JPG/PNG，縮放到 maxSize（最長邊）並輸出為 data URL。
 * square = true 時會裁切為正方形（頭貼用）。
 */
export async function fileToResizedDataUrl(
  file: File,
  maxSize: number,
  square = false,
): Promise<ImageResult> {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return { ok: false, error: "僅支援 JPG 或 PNG 圖片" };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { ok: false, error: "圖片大小不可超過 5MB" };
  }

  const sourceUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("load"));
      el.src = sourceUrl;
    });

    let sx = 0;
    let sy = 0;
    let sw = img.naturalWidth;
    let sh = img.naturalHeight;
    if (square) {
      const side = Math.min(sw, sh);
      sx = (sw - side) / 2;
      sy = (sh - side) / 2;
      sw = side;
      sh = side;
    }

    const scale = Math.min(1, maxSize / Math.max(sw, sh));
    const dw = Math.max(1, Math.round(sw * scale));
    const dh = Math.max(1, Math.round(sh * scale));

    const canvas = document.createElement("canvas");
    canvas.width = dw;
    canvas.height = dh;
    const ctx = canvas.getContext("2d");
    if (!ctx) return { ok: false, error: "無法處理圖片" };
    ctx.fillStyle = "#18181b";
    ctx.fillRect(0, 0, dw, dh);
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, dw, dh);

    return { ok: true, dataUrl: canvas.toDataURL("image/jpeg", 0.85) };
  } catch {
    return { ok: false, error: "圖片讀取失敗，請換一張再試" };
  } finally {
    URL.revokeObjectURL(sourceUrl);
  }
}
