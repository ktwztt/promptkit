import { createOpenAI } from "@ai-sdk/openai"

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
})

// ponytail: single model, add model picker when users demand it
export function getModel(modelId?: string) {
  return openai(modelId || "gpt-4o")
}

export const AI_MODELS = [
  { id: "gpt-4o", name: "ChatGPT (GPT-4o)", provider: "OpenAI" },
  { id: "gpt-4", name: "ChatGPT (GPT-4)", provider: "OpenAI" },
  { id: "claude-3.5", name: "Claude 3.5 Sonnet", provider: "Anthropic" },
  { id: "claude-3", name: "Claude 3 Opus", provider: "Anthropic" },
  { id: "gemini-2.0", name: "Gemini 2.0 Flash", provider: "Google" },
  { id: "deepseek-v3", name: "DeepSeek V3", provider: "DeepSeek" },
  { id: "grok-3", name: "Grok 3", provider: "xAI" },
] as const
