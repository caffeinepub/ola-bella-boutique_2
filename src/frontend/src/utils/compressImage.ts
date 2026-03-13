/**
 * Compress an image file to a base64 data URL targeting a small size.
 * Uses canvas to resize and compress the image.
 */
export async function compressImageToDataUrl(
  file: File,
  targetBytes = 150_000,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const canvas = document.createElement("canvas");

      // Scale down if needed — max 600px on longest side
      let { width, height } = img;
      const MAX_SIZE = 600;
      if (width > MAX_SIZE || height > MAX_SIZE) {
        if (width >= height) {
          height = Math.round((height / width) * MAX_SIZE);
          width = MAX_SIZE;
        } else {
          width = Math.round((width / height) * MAX_SIZE);
          height = MAX_SIZE;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas not supported"));
      ctx.drawImage(img, 0, 0, width, height);

      // Try progressively lower quality until it fits
      const tryQuality = (quality: number) => {
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        // base64 overhead: each char ~0.75 bytes
        const estimatedBytes = (dataUrl.length * 3) / 4;
        if (estimatedBytes <= targetBytes || quality <= 0.15) {
          resolve(dataUrl);
        } else {
          tryQuality(Math.round((quality - 0.1) * 100) / 100);
        }
      };
      tryQuality(0.7);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("No se pudo leer la imagen"));
    };
    img.src = objectUrl;
  });
}
