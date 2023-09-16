export const convertImageHash = (
  imageHash: Buffer | Uint8Array | null | undefined,
) => (imageHash ? new Uint8Array(imageHash) : null);
