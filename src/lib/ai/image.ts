import sharp from 'sharp'

const MAX_DIMENSION = 1568
const JPEG_QUALITY = 82

export type CompressedImage = {
  base64: string
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif'
  bytes: number
}

export async function compressForVision(buffer: ArrayBuffer | Buffer): Promise<CompressedImage> {
  const input = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer)
  const meta = await sharp(input).metadata()
  const needsResize = (meta.width ?? 0) > MAX_DIMENSION || (meta.height ?? 0) > MAX_DIMENSION

  let pipeline = sharp(input).rotate()
  if (needsResize) {
    pipeline = pipeline.resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: 'inside', withoutEnlargement: true })
  }

  const out = await pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toBuffer()
  return { base64: out.toString('base64'), mimeType: 'image/jpeg', bytes: out.byteLength }
}
