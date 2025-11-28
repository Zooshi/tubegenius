import { TextOverlay } from '../types';

export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 720;

export function drawThumbnail(
  canvas: HTMLCanvasElement,
  backgroundImage: string | null,
  textOverlay: TextOverlay
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  if (backgroundImage) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.drawImage(img, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      drawText(ctx, textOverlay);
    };
    img.src = backgroundImage;
  } else {
    drawText(ctx, textOverlay);
  }
}

function drawText(ctx: CanvasRenderingContext2D, overlay: TextOverlay): void {
  if (!overlay.text) return;

  ctx.font = `${overlay.fontSize}px ${overlay.fontFamily}`;
  ctx.fillStyle = overlay.color;
  ctx.textBaseline = 'top';

  ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 3;
  ctx.shadowOffsetY = 3;

  ctx.fillText(overlay.text, overlay.x, overlay.y);

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
}

export function downloadCanvas(canvas: HTMLCanvasElement, filename: string): void {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }, 'image/png');
}

export function loadImageAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        resolve(result);
      } else {
        reject(new Error('Failed to load image'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export function constrainPosition(
  x: number,
  y: number,
  text: string,
  fontSize: number,
  fontFamily: string
): { x: number; y: number } {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return { x, y };

  ctx.font = `${fontSize}px ${fontFamily}`;
  const metrics = ctx.measureText(text);
  const textWidth = metrics.width;
  const textHeight = fontSize;

  const constrainedX = Math.max(0, Math.min(x, CANVAS_WIDTH - textWidth));
  const constrainedY = Math.max(0, Math.min(y, CANVAS_HEIGHT - textHeight));

  return { x: constrainedX, y: constrainedY };
}
