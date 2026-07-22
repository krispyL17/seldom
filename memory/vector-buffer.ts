/**
 * Serialize embeddings for SQLite BLOB storage (Node only).
 */

export function embeddingToBuffer(embedding: number[]): Buffer {
  return Buffer.from(new Float32Array(embedding).buffer)
}

export function bufferToEmbedding(buffer: Buffer | Uint8Array): number[] {
  const bytes = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer)
  const floats = new Float32Array(bytes.buffer, bytes.byteOffset, bytes.byteLength / 4)
  return Array.from(floats)
}
