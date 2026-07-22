import { encodingForModel, type TiktokenModel } from "js-tiktoken"

const MODEL_ENCODINGS: Record<string, TiktokenModel> = {
  "gpt-4o": "gpt-4o",
  "gpt-4": "gpt-4",
  "gpt-3.5-turbo": "gpt-3.5-turbo",
  "claude-3": "gpt-4o", // closest approximation
  "claude-3.5": "gpt-4o",
  "gemini-2.0": "gpt-4o",
  "deepseek-v3": "gpt-4o",
  "grok-3": "gpt-4o",
}

const COST_PER_1K: Record<string, { input: number; output: number }> = {
  "gpt-4o": { input: 0.0025, output: 0.01 },
  "gpt-4": { input: 0.03, output: 0.06 },
  "gpt-3.5-turbo": { input: 0.0005, output: 0.0015 },
  "claude-3": { input: 0.003, output: 0.015 },
  "claude-3.5": { input: 0.003, output: 0.015 },
  "gemini-2.0": { input: 0.000125, output: 0.000375 },
  "deepseek-v3": { input: 0.00027, output: 0.0011 },
  "grok-3": { input: 0.002, output: 0.008 },
}

const MODEL_CONTEXT_LIMITS: Record<string, number> = {
  "gpt-4o": 128000,
  "gpt-4": 8192,
  "gpt-3.5-turbo": 16385,
  "claude-3": 200000,
  "claude-3.5": 200000,
  "gemini-2.0": 1048576,
  "deepseek-v3": 65536,
  "grok-3": 131072,
}

export interface TokenStats {
  chars: number
  words: number
  tokens: number
  costInput: number
  costOutput: number
  contextLimit: number
  contextPercent: number
}

export function countTokens(text: string, model: string = "gpt-4o"): TokenStats {
  const encoding = MODEL_ENCODINGS[model] || "gpt-4o"
  let tokens: number
  try {
    const enc = encodingForModel(encoding)
    tokens = enc.encode(text).length
  } catch {
    tokens = Math.ceil(text.length / 4)
  }

  const chars = text.length
  const words = text.trim() ? text.trim().split(/\s+/).length : 0
  const cost = COST_PER_1K[model] || COST_PER_1K["gpt-4o"]
  const contextLimit = MODEL_CONTEXT_LIMITS[model] || 128000

  return {
    chars,
    words,
    tokens,
    costInput: (tokens / 1000) * cost.input,
    costOutput: (tokens / 1000) * cost.output,
    contextLimit,
    contextPercent: (tokens / contextLimit) * 100,
  }
}
