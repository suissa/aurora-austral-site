// ============================================================================
// one-llm-4-all — Public API
// ============================================================================
// Ultra-resilient LLM orchestration library with:
//   • Nominal semantic TypeScript types (compile-time brand safety)
//   • 3 rotation modes: self-rotate, ultra-rotate, premium-rotate
//   • Dynamic free-model discovery from OpenRouter API
//   • Multi-provider support (OpenAI, Anthropic, Gemini, DeepSeek, etc.)
//   • Multi-key rotation with quota exhaustion fallback
//   • NEVER returns an error — always provides a response
//   • Transparent model selection — caller never picks the model
// ============================================================================

// Re-export types
export type {
  ApiKey,
  ModelId,
  ProviderId,
  MaskedKey,
  CombinationId,
  RotationMode,
  ProviderConfig,
  OneLLMConfig,
  BlacklistState,
  SendPromptOptions,
  ILLMResponse,
} from "./types.js";

export {
  ApiKey  as mkApiKey,
  ModelId as mkModelId,
  ProviderId as mkProviderId,
} from "./types.js";

// Re-export engine
export { OneLLMEngine }      from "./engine.js";
export { loadConfigFromEnv } from "./config.js";

// ---------------------------------------------------------------------------
// Convenience singleton — for quick usage without manual setup
// ---------------------------------------------------------------------------

import { OneLLMEngine }      from "./engine.js";
import { loadConfigFromEnv } from "./config.js";
import type { SendPromptOptions, ILLMResponse } from "./types.js";

let _singleton: OneLLMEngine | null = null;

function getEngine(): OneLLMEngine {
  if (!_singleton) {
    const config = loadConfigFromEnv();
    _singleton = new OneLLMEngine(config);
  }
  return _singleton;
}

/**
 * Sends a prompt using the global singleton engine.
 * The model is selected automatically by the rotation engine.
 *
 * **NEVER throws.** Always returns a valid ILLMResponse.
 *
 * @example
 * ```ts
 * import { sendPrompt } from "@purecore-ts/one-llm-4-all";
 *
 * const response = await sendPrompt("Explique quantum computing");
 * console.log(response.getText());
 * console.log(`Respondido por: ${response.modelUsed}`);
 * ```
 */
export async function sendPrompt(
  prompt:  string,
  options: SendPromptOptions = {},
): Promise<ILLMResponse> {
  return getEngine().sendPrompt(prompt, options);
}

/**
 * Resets the global singleton, forcing a new config load on next call.
 * Useful for testing or when env vars change at runtime.
 */
export function resetEngine(): void {
  _singleton = null;
}

/**
 * Creates a new standalone engine with custom configuration.
 * Use this when you need multiple independent LLM pools.
 *
 * @example
 * ```ts
 * import { createEngine, loadConfigFromEnv } from "@purecore-ts/one-llm-4-all";
 *
 * const config = loadConfigFromEnv();
 * const engine = createEngine({ ...config, rotationMode: "ultra-rotate" });
 * const response = await engine.sendPrompt("Hello!");
 * ```
 */
export function createEngine(config: import("./types.js").OneLLMConfig): OneLLMEngine {
  return new OneLLMEngine(config);
}

// ---------------------------------------------------------------------------
// Backward compatibility — `sendPrompt` with legacy options
// ---------------------------------------------------------------------------

export interface LegacyLLMOptions {
  system?: string;
  model?: string;
  apiKey?: string;
  json?: boolean;
  provider?: string;
  temperature?: number;
  response_format?: unknown;
}

/**
 * Legacy-compatible wrapper. Accepts the old `LLMOptions` shape but ignores
 * `model`, `apiKey`, and `provider` — those are now managed internally.
 *
 * @deprecated Use `sendPrompt(prompt, { system?, temperature?, json? })` instead.
 */
export async function sendPromptLegacy(
  prompt:  string,
  options: LegacyLLMOptions = {},
): Promise<ILLMResponse> {
  if (options.model || options.apiKey || options.provider) {
    console.warn(
      "⚠️  [one-llm-4-all] sendPromptLegacy: 'model', 'apiKey' e 'provider' são " +
      "ignorados — o sistema gerencia isso automaticamente."
    );
  }
  return sendPrompt(prompt, {
    system:      options.system,
    temperature: options.temperature,
    json:        options.json,
  });
}
