/**
 * Single source of truth for capturing a frame from a live <video> element.
 * Replaces the three near-identical canvas captures that lived in
 * useContinuousVision, useContinuousMonitoring and ChatInterface.
 */

function drawToCanvas(video: HTMLVideoElement | null): HTMLCanvasElement {
  if (!video) {
    throw new Error('Video element not found');
  }
  if (video.readyState < 2) {
    throw new Error('Video not ready');
  }

  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  ctx.drawImage(video, 0, 0);
  return canvas;
}

/** Capture as a base64 data URL (used by the continuous vision stream). */
export function captureFrameAsDataUrl(video: HTMLVideoElement | null, quality = 0.8): string {
  return drawToCanvas(video).toDataURL('image/jpeg', quality);
}

/** Capture as a JPEG Blob (used by pill checks and uploads). */
export function captureFrameAsBlob(video: HTMLVideoElement | null, quality = 0.9): Promise<Blob> {
  const canvas = drawToCanvas(video);
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => (blob ? resolve(blob) : reject(new Error('Failed to create image blob'))),
      'image/jpeg',
      quality
    );
  });
}

/**
 * Cheap perceptual signature: 8x8 grayscale downsample (64 numbers).
 * Comparing signatures between frames lets the monitoring loop skip
 * AI analysis entirely when nothing in the room has changed.
 */
export function frameSignature(video: HTMLVideoElement | null): number[] {
  if (!video || video.readyState < 2) {
    throw new Error('Video not ready');
  }
  const canvas = document.createElement('canvas');
  canvas.width = 8;
  canvas.height = 8;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');
  ctx.drawImage(video, 0, 0, 8, 8);
  const { data } = ctx.getImageData(0, 0, 8, 8);
  const sig: number[] = [];
  for (let i = 0; i < data.length; i += 4) {
    sig.push(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
  }
  return sig;
}

/** Mean absolute difference between two signatures (0-255 scale). */
export function signatureDiff(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 255;
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += Math.abs(a[i] - b[i]);
  return sum / a.length;
}
