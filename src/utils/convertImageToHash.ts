import { createCanvas, loadImage } from '@napi-rs/canvas';
import { rgbaToThumbHash } from 'thumbhash';

export const convertImageToHash = async (imageUrl: string) => {
  const maxSize = 100;

  const image = await loadImage(imageUrl);
  const height = image.height;
  const width = image.width;

  const scale = Math.min(maxSize / width, maxSize / height);
  const resizedWidth = Math.floor(width * scale);
  const resizedHeight = Math.floor(height * scale);

  const canvas = createCanvas(resizedWidth, resizedHeight);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0, resizedWidth, resizedHeight);

  const imageData = ctx.getImageData(0, 0, resizedWidth, resizedHeight);
  const rgba = new Uint8Array(imageData.data.buffer);
  return rgbaToThumbHash(resizedWidth, resizedHeight, rgba);
};
