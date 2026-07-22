export interface CleanOptions {
  removeMarkdown: boolean
  removeHtml: boolean
  removeEmoji: boolean
  removeSpecialChars: boolean
  normalizeSpaces: boolean
  normalizeNewlines: boolean
}

const DEFAULT_OPTIONS: CleanOptions = {
  removeMarkdown: true,
  removeHtml: true,
  removeEmoji: false,
  removeSpecialChars: false,
  normalizeSpaces: true,
  normalizeNewlines: true,
}

export function cleanPrompt(text: string, options: Partial<CleanOptions> = {}): string {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  let result = text

  if (opts.removeHtml) {
    result = result.replace(/<[^>]*>/g, "")
  }

  if (opts.removeMarkdown) {
    result = result.replace(/^#{1,6}\s+/gm, "")
    result = result.replace(/\*\*(.+?)\*\*/g, "$1")
    result = result.replace(/\*(.+?)\*/g, "$1")
    result = result.replace(/`{1,3}[^`]*`{1,3}/g, "")
    result = result.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    result = result.replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    result = result.replace(/^>\s+/gm, "")
    result = result.replace(/^[-*+]\s+/gm, "")
    result = result.replace(/^\d+\.\s+/gm, "")
    result = result.replace(/^---+/gm, "")
    result = result.replace(/~~(.+?)~~/g, "$1")
    result = result.replace(/\|/g, " ")
  }

  if (opts.removeEmoji) {
    result = result.replace(
      /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}]/gu,
      ""
    )
  }

  if (opts.removeSpecialChars) {
    result = result.replace(/[^\w\s一-鿿぀-ゟ゠-ヿ@#$%&*()\[\]{};:'",.<>/?\\\-+=~`!^_|]/g, " ")
  }

  if (opts.normalizeSpaces) {
    result = result.replace(/[ \t]+/g, " ")
    result = result.replace(/^[ \t]+/gm, "")
    result = result.replace(/[ \t]+$/gm, "")
  }

  if (opts.normalizeNewlines) {
    result = result.replace(/\n{3,}/g, "\n\n")
    result = result.replace(/^\n+/, "")
    result = result.replace(/\n+$/, "")
  }

  return result.trim()
}

export function getCleaningDiff(original: string, cleaned: string): { removed: number; percent: number } {
  const removed = original.length - cleaned.length
  return {
    removed,
    percent: original.length > 0 ? (removed / original.length) * 100 : 0,
  }
}
