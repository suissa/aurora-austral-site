// ============================================================================
// one-llm-4-all — Nominal Semantic Types
// ============================================================================
// Branded / nominal types ensure compile-time safety: an ApiKey cannot be
// accidentally passed where a ModelId is expected, even though both are strings.
// ============================================================================

/** Compile-time brand symbol (zero runtime cost). */
declare const __brand: unique symbol;

/** Generic branded-type factory. */
type Brand<T, B extends string> = T & { readonly [__brand]: B };

// ---------------------------------------------------------------------------
// Nominal string types
// ---------------------------------------------------------------------------

/** A validated API key string. */
export type ApiKey       = Brand<string, "ApiKey">;

/** A provider model identifier, e.g. "openai/gpt-4o". */
export type ModelId      = Brand<string, "ModelId">;

/** A provider name slug, e.g. "openrouter" | "openai". */
export type ProviderId   = Brand<string, "ProviderId">;

/** Masked key for logging (never the real secret). */
export type MaskedKey    = Brand<string, "MaskedKey">;

/** Unique combination id for blacklist tracking. */
export type CombinationId = Brand<string, "CombinationId">;

// ---------------------------------------------------------------------------
// Smart constructors (runtime validation + branding)
// ---------------------------------------------------------------------------

export function ApiKey(raw: string): ApiKey {
  const trimmed = raw.trim();
  if (trimmed.length < 8) throw new Error("ApiKey inválida: muito curta");
  return trimmed as ApiKey;
}

export function ModelId(raw: string): ModelId {
  const trimmed = raw.trim();
  if (trimmed.length === 0) throw new Error("ModelId vazio");
  return trimmed as ModelId;
}

export function ProviderId(raw: string): ProviderId {
  const trimmed = raw.trim().toLowerCase();
  if (trimmed.length === 0) throw new Error("ProviderId vazio");
  return trimmed as ProviderId;
}

export function MaskedKey(key: ApiKey): MaskedKey {
  return `...${(key as string).slice(-6)}` as MaskedKey;
}

export function CombinationId(key: ApiKey, model: ModelId): CombinationId {
  return `${(key as string).slice(-8)}:${model}` as CombinationId;
}

// ---------------------------------------------------------------------------
// Rotation modes
// ---------------------------------------------------------------------------

/**
 * - `self-rotate`    — Rotates models per message; rotates key only after all
 *                      quotas for that key are exhausted. (DEFAULT)
 * - `ultra-rotate`   — Rotates BOTH model AND key on every single message.
 *                      No two consecutive messages share the same key.
 * - `premium-rotate` — Prioritises paid/premium provider models; falls back
 *                      to OpenRouter free models only after paid quotas run out.
 */
export type RotationMode = "self-rotate" | "ultra-rotate" | "premium-rotate";

// ---------------------------------------------------------------------------
// Provider configuration
// ---------------------------------------------------------------------------

/** Configuration for a single AI provider (OpenAI, Anthropic, etc.). */
export interface ProviderConfig {
  readonly providerId: ProviderId;
  readonly baseUrl:    string;
  readonly apiKeys:    readonly ApiKey[];
  readonly models:     readonly ModelId[];
  /** If true, these models are considered "paid/premium". */
  readonly isPremium:  boolean;
}

// ---------------------------------------------------------------------------
// Engine configuration
// ---------------------------------------------------------------------------

export interface OneLLMConfig {
  /** Rotation strategy. Defaults to `"self-rotate"`. */
  readonly rotationMode: RotationMode;

  /** Registered providers (paid and/or free). */
  readonly providers: readonly ProviderConfig[];

  /** OpenRouter API keys loaded from env (main + extras). */
  readonly openRouterKeys: readonly ApiKey[];

  /** Free-model cache TTL in ms. Default 15 min. */
  readonly freeModelCacheTtlMs: number;

  /** Rate-limit blacklist cooldown in ms. Default 5 min. */
  readonly rateLimitCooldownMs: number;

  /** Maximum key attempts per model. Default 3. */
  readonly maxKeyAttemptsPerModel: number;
}

// ---------------------------------------------------------------------------
// Blacklist state
// ---------------------------------------------------------------------------

export interface BlacklistState {
  models:       ModelId[];
  keys:         ApiKey[];
  combinations: CombinationId[];
}

// ---------------------------------------------------------------------------
// Send options (user-facing)
// ---------------------------------------------------------------------------

/**
 * Options for `sendPrompt`. Note: the caller NEVER specifies which model to
 * use — the engine decides internally based on rotation + state.
 */
export interface SendPromptOptions {
  /** System prompt prepended to the conversation. */
  readonly system?: string;
  /** Request temperature (0–2). Default 0.2. */
  readonly temperature?: number;
  /** If true, asks the LLM for JSON output. */
  readonly json?: boolean;
}

// ---------------------------------------------------------------------------
// LLM Response
// ---------------------------------------------------------------------------

export interface ILLMResponse {
  getText(): string;
  getJSON<T = unknown>(): T | null;
  /** Which model actually answered. */
  readonly modelUsed: ModelId;
  /** Which provider answered. */
  readonly providerUsed: ProviderId;
}
