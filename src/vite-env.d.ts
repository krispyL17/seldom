/// <reference types="vite/client" />

/**
 * Vite environment variable type definitions.
 * Extend this as new env vars are added.
 */
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
