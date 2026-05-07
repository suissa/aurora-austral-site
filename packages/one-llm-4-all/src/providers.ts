// ============================================================================
// one-llm-4-all — Provider Registry
// ============================================================================
// Maps known AI provider slugs to their OpenAI-compatible chat-completion URLs.
// All registered providers use the OpenAI-compatible API format.
// ============================================================================

import { type ProviderId, ProviderId as mkProviderId } from "./types.js";

interface ProviderMeta {
  readonly baseUrl: string;
  /** Human-readable label for logging. */
  readonly label: string;
}

const PROVIDER_REGISTRY: ReadonlyMap<string, ProviderMeta> = new Map([
  ["openrouter", { baseUrl: "https://openrouter.ai/api/v1/chat/completions",   label: "OpenRouter"  }],
  ["openai",     { baseUrl: "https://api.openai.com/v1/chat/completions",      label: "OpenAI"      }],
  ["anthropic",  { baseUrl: "https://api.anthropic.com/v1/messages",           label: "Anthropic"   }],
  ["gemini",     { baseUrl: "https://generativelanguage.googleapis.com/v1beta/chat/completions", label: "Google Gemini" }],
  ["deepseek",   { baseUrl: "https://api.deepseek.com/v1/chat/completions",    label: "DeepSeek"    }],
  ["qwen",       { baseUrl: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions", label: "Qwen" }],
  ["mistral",    { baseUrl: "https://api.mistral.ai/v1/chat/completions",      label: "Mistral"     }],
  ["groq",       { baseUrl: "https://api.groq.com/openai/v1/chat/completions", label: "Groq"        }],
  ["together",   { baseUrl: "https://api.together.xyz/v1/chat/completions",    label: "Together AI" }],
  ["fireworks",  { baseUrl: "https://api.fireworks.ai/inference/v1/chat/completions", label: "Fireworks" }],
  ["xai",        { baseUrl: "https://api.x.ai/v1/chat/completions",            label: "xAI (Grok)"  }],
  ["cohere",     { baseUrl: "https://api.cohere.ai/v1/chat",                   label: "Cohere"      }],
  ["perplexity", { baseUrl: "https://api.perplexity.ai/chat/completions",      label: "Perplexity"  }],
]);

export function getProviderBaseUrl(provider: ProviderId): string {
  const meta = PROVIDER_REGISTRY.get(provider as string);
  if (meta) return meta.baseUrl;
  // Se não está no registro, pode ser uma URL customizada passada diretamente
  return `https://api.${provider}.com/v1/chat/completions`;
}

export function getProviderLabel(provider: ProviderId): string {
  const meta = PROVIDER_REGISTRY.get(provider as string);
  return meta?.label ?? (provider as string).toUpperCase();
}

export function isAnthropicProvider(provider: ProviderId): boolean {
  return (provider as string) === "anthropic";
}

export function getAllKnownProviders(): ProviderId[] {
  return [...PROVIDER_REGISTRY.keys()].map(k => mkProviderId(k));
}
