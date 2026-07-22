import { DEFAULT_MEMORY_CONFIG } from '../../memory/types.js'
import { startMemoryServer } from './http/server.js'

const port = Number(process.env.MEMORY_PORT ?? DEFAULT_MEMORY_CONFIG.port)

startMemoryServer({
  ...DEFAULT_MEMORY_CONFIG,
  dbPath: process.env.MEMORY_DB_PATH ?? DEFAULT_MEMORY_CONFIG.dbPath,
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL ?? DEFAULT_MEMORY_CONFIG.ollamaBaseUrl,
  embeddingModel: process.env.OLLAMA_EMBED_MODEL ?? DEFAULT_MEMORY_CONFIG.embeddingModel,
  port,
})
