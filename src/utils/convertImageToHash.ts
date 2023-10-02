import { createCanvas, loadImage } from '@napi-rs/canvas';
import { rgbaToThumbHash } from 'thumbhash';
import type { Nullable } from '~/types/utils';

export const convertImageToHash = async (
  imageId: Nullable<string>,
): Promise<null | Buffer> => {
  const maxSize = 100;

  if (!imageId) return null;

  let image;

  try {
    image = await loadImage('https://image.tmdb.org/t/p/w500' + imageId);
  } catch (error) {
    console.error(error);
    return null;
  }

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
  return Buffer.from(rgbaToThumbHash(resizedWidth, resizedHeight, rgba));
};
