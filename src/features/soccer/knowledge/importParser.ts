import type { KnowledgeImportChunk } from '../athlete/types'

export type ImportFileType = 'markdown' | 'text' | 'json'

export interface ParsedKnowledgeImport {
  chunks: Omit<KnowledgeImportChunk, 'id' | 'importedAt'>[]
  warnings: string[]
}

function categorize(text: string): KnowledgeImportChunk['category'] {
  const lower = text.toLowerCase()
  if (/recover|rest|sleep|mobility|stretch|fatigue/.test(lower)) return 'recovery'
  if (/goal|target|milestone|objective/.test(lower)) return 'goals'
  if (/drill|technique|skill|touch|pass|shoot|form/.test(lower)) return 'technique'
  if (/session|workout|training|practice|plan/.test(lower)) return 'training'
  return 'general'
}

function titleFromContent(content: string, index: number): string {
  const firstLine = content.split('\n').find((l) => l.trim())?.trim() ?? ''
  const cleaned = firstLine.replace(/^#+\s*/, '').slice(0, 80)
  return cleaned || `Import section ${index + 1}`
}

function chunkText(content: string, sourceFile: string): ParsedKnowledgeImport['chunks'] {
  const sections = content
    .split(/\n(?=#{1,3}\s)|\n{2,}/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20)

  if (sections.length === 0 && content.trim().length > 0) {
    return [
      {
        sourceFile,
        category: categorize(content),
        title: titleFromContent(content, 0),
        content: content.trim().slice(0, 4000),
      },
    ]
  }

  return sections.slice(0, 50).map((section, i) => ({
    sourceFile,
    category: categorize(section),
    title: titleFromContent(section, i),
    content: section.slice(0, 4000),
  }))
}

function parseJsonKnowledge(raw: string, sourceFile: string): ParsedKnowledgeImport {
  const warnings: string[] = []
  try {
    const data = JSON.parse(raw) as unknown
    if (Array.isArray(data)) {
      const chunks = data
        .filter((item) => item && typeof item === 'object')
        .slice(0, 50)
        .map((item, i) => {
          const row = item as Record<string, unknown>
          const content =
            String(row.content ?? row.text ?? row.body ?? row.note ?? JSON.stringify(row)).slice(0, 4000)
          return {
            sourceFile,
            category: categorize(content),
            title: String(row.title ?? row.name ?? titleFromContent(content, i)),
            content,
          }
        })
      return { chunks, warnings }
    }
    if (data && typeof data === 'object') {
      const obj = data as Record<string, unknown>
      const content = JSON.stringify(obj, null, 2).slice(0, 8000)
      return {
        chunks: [
          {
            sourceFile,
            category: 'general',
            title: String(obj.title ?? sourceFile),
            content,
          },
        ],
        warnings,
      }
    }
  } catch {
    warnings.push('JSON parse failed — treated as plain text.')
  }
  return { chunks: chunkText(raw, sourceFile), warnings }
}

export function parseKnowledgeFile(content: string, filename: string): ParsedKnowledgeImport {
  const lower = filename.toLowerCase()
  if (lower.endsWith('.json')) return parseJsonKnowledge(content, filename)
  return { chunks: chunkText(content, filename), warnings: [] }
}

export function detectImportType(filename: string): ImportFileType {
  const lower = filename.toLowerCase()
  if (lower.endsWith('.json')) return 'json'
  if (lower.endsWith('.md') || lower.endsWith('.markdown')) return 'markdown'
  return 'text'
}

/** Future: ChatGPT export JSON schema adapter hook */
export function isChatGptExportShape(data: unknown): boolean {
  return (
    typeof data === 'object' &&
    data !== null &&
    ('mapping' in data || 'title' in data) &&
    Array.isArray((data as { messages?: unknown }).messages)
  )
}
