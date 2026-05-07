// ============================================================================
// one-llm-4-all — HTTP Client
// ============================================================================
// Handles the actual HTTP calls to LLM providers, abstracting provider-
// specific quirks (e.g. Anthropic's different API format).
// ============================================================================

import {
  type ApiKey,
  type ModelId,
  type ProviderId,
  MaskedKey,
} from "./types.js";
import { isAnthropicProvider } from "./providers.js";

export interface ChatMessage {
  readonly role: "system" | "user" | "assistant";
  readonly content: string;
}

export interface LLMHttpResponse {
  readonly ok: boolean;
  readonly status: number;
  readonly content: string;
  readonly rawBody: string;
}

/**
 * Sends a chat completion request to the specified provider endpoint.
 * Handles Anthropic's different API format transparently.
 */
export async function sendChatCompletion(
  baseUrl:     string,
  key:         ApiKey,
  model:       ModelId,
  provider:    ProviderId,
  messages:    readonly ChatMessage[],
  temperature: number,
  jsonMode:    boolean,
): Promise<LLMHttpResponse> {
  const masked = MaskedKey(key);

  // Anthropic has a different API format
  if (isAnthropicProvider(provider)) {
    return sendAnthropicRequest(baseUrl, key, model, messages, temperature);
  }

  // Standard OpenAI-compatible format
  const headers: Record<string, string> = {
    "Authorization":  `Bearer ${key}`,
    "Content-Type":   "application/json",
    "HTTP-Referer":   "https://omnichannelbridge.com",
    "X-Title":        "OneLLM4All",
  };

  const body: Record<string, unknown> = {
    model: model as string,
    messages: messages.map(m => ({ role: m.role, content: m.content })),
    temperature,
  };

  if (jsonMode) {
    body["response_format"] = { type: "json_object" };
  }

  const res = await fetch(baseUrl, {
    method:  "POST",
    headers,
    body:    JSON.stringify(body),
  });

  if (!res.ok) {
    const rawBody = await res.text();
    return { ok: false, status: res.status, content: "", rawBody };
  }

  const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
  const content = data.choices?.[0]?.message?.content ?? "";

  return { ok: true, status: res.status, content, rawBody: "" };
}

/**
 * Anthropic uses a different request format with `x-api-key` header,
 * `anthropic-version` header, and a different body structure.
 */
async function sendAnthropicRequest(
  baseUrl:     string,
  key:         ApiKey,
  model:       ModelId,
  messages:    readonly ChatMessage[],
  temperature: number,
): Promise<LLMHttpResponse> {
  const systemMsg = messages.find(m => m.role === "system");
  const nonSystemMsgs = messages.filter(m => m.role !== "system");

  const headers: Record<string, string> = {
    "x-api-key":         key as string,
    "anthropic-version": "2023-06-01",
    "Content-Type":      "application/json",
  };

  const body: Record<string, unknown> = {
    model: model as string,
    max_tokens: 4096,
    temperature,
    messages: nonSystemMsgs.map(m => ({ role: m.role, content: m.content })),
  };

  if (systemMsg) {
    body["system"] = systemMsg.content;
  }

  const res = await fetch(baseUrl, {
    method:  "POST",
    headers,
    body:    JSON.stringify(body),
  });

  if (!res.ok) {
    const rawBody = await res.text();
    return { ok: false, status: res.status, content: "", rawBody };
  }

  const data = await res.json() as { content?: Array<{ text?: string }> };
  const content = data.content?.[0]?.text ?? "";

  return { ok: true, status: res.status, content, rawBody: "" };
}
