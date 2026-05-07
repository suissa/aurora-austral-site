// ============================================================================
// one-llm-4-all — Core Engine
// ============================================================================
// The heart of the library. Orchestrates:
//   1. Dynamic free-model fetching from OpenRouter API
//   2. Rotation strategy execution
//   3. HTTP dispatch with full error handling
//   4. Blacklist management
//   5. NEVER returns an error to the user (ultimate resilience)
// ============================================================================

import {
  type ApiKey,
  type ModelId,
  type ProviderId,
  type OneLLMConfig,
  type SendPromptOptions,
  type ILLMResponse,
  ModelId  as mkModelId,
  MaskedKey,
} from "./types.js";
import { BlacklistManager }    from "./blacklist.js";
import { RotationEngine }      from "./rotation.js";
import { sendChatCompletion }  from "./http.js";
import { getProviderLabel }    from "./providers.js";

// ---------------------------------------------------------------------------
// LLM Response implementation
// ---------------------------------------------------------------------------

class LLMResponse implements ILLMResponse {
  constructor(
    private readonly content: string,
    public  readonly modelUsed: ModelId,
    public  readonly providerUsed: ProviderId,
  ) {}

  getText(): string {
    return this.content;
  }

  getJSON<T = unknown>(): T | null {
    try {
      let cleaned = this.content.trim();
      if (cleaned.startsWith("```json")) {
        cleaned = cleaned.replace(/^```json\s*/, "").replace(/\s*```$/, "");
      } else if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```\w*\s*/, "").replace(/\s*```$/, "");
      }
      return JSON.parse(cleaned) as T;
    } catch {
      console.error("⚠️  [one-llm-4-all] Falha ao parsear JSON da resposta LLM.");
      return null;
    }
  }
}

// ---------------------------------------------------------------------------
// Free model cache
// ---------------------------------------------------------------------------

interface FreeModelCache {
  models:    ModelId[];
  fetchedAt: number;
}

// ---------------------------------------------------------------------------
// Emergency fallback response
// ---------------------------------------------------------------------------

const EMERGENCY_RESPONSE_TEXT =
  "Desculpe, todos os modelos de IA estão temporariamente indisponíveis. " +
  "Por favor, tente novamente em alguns instantes.";

// ---------------------------------------------------------------------------
// OneLLMEngine
// ---------------------------------------------------------------------------

export class OneLLMEngine {
  private readonly config:    OneLLMConfig;
  private readonly blacklist: BlacklistManager;
  private readonly rotation:  RotationEngine;

  private freeModelCache: FreeModelCache | null = null;

  constructor(config: OneLLMConfig) {
    this.config    = config;
    this.blacklist = new BlacklistManager(config.rateLimitCooldownMs);
    this.rotation  = new RotationEngine(config.rotationMode, this.blacklist);
  }

  // =========================================================================
  // PUBLIC API
  // =========================================================================

  /**
   * Sends a prompt to an LLM. The model is selected internally based on the
   * rotation mode and system state — the caller NEVER specifies it.
   *
   * **NEVER throws.** Returns an emergency fallback response if absolutely
   * everything fails.
   */
  async sendPrompt(prompt: string, options: SendPromptOptions = {}): Promise<ILLMResponse> {
    try {
      return await this.executeWithRotation(prompt, options);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error(`🔥 [one-llm-4-all] FALHA TOTAL: ${errMsg}`);
      console.error(`🔥 [one-llm-4-all] Retornando resposta de emergência.`);

      // NUNCA retorna erro para o usuário
      return new LLMResponse(
        EMERGENCY_RESPONSE_TEXT,
        mkModelId("emergency-fallback"),
        "internal" as ProviderId,
      );
    }
  }

  /**
   * Forces a refresh of the free models cache.
   */
  async refreshFreeModels(): Promise<ModelId[]> {
    this.freeModelCache = null;
    return this.getFreeModels();
  }

  // =========================================================================
  // CORE ROTATION LOOP
  // =========================================================================

  private async executeWithRotation(
    prompt:  string,
    options: SendPromptOptions,
  ): Promise<ILLMResponse> {
    // Fetch free models (cached)
    const freeModels = await this.getFreeModels();
    const freeBaseUrl = "https://openrouter.ai/api/v1/chat/completions";

    // Get ordered candidates from the rotation engine
    const candidates = this.rotation.getCandidates(
      this.config.providers,
      freeModels,
      this.config.openRouterKeys,
      freeBaseUrl,
    );

    if (candidates.length === 0) {
      console.warn("⚠️  [one-llm-4-all] Nenhum candidato disponível após filtragem.");
      return new LLMResponse(
        EMERGENCY_RESPONSE_TEXT,
        mkModelId("no-candidates"),
        "internal" as ProviderId,
      );
    }

    const errors: string[] = [];
    let keyAttemptsForCurrentModel = 0;
    let currentModel: ModelId | null = null;

    for (const candidate of candidates) {
      // Track key attempts per model
      if (currentModel !== candidate.model) {
        currentModel = candidate.model;
        keyAttemptsForCurrentModel = 0;
      }
      keyAttemptsForCurrentModel++;

      if (keyAttemptsForCurrentModel > this.config.maxKeyAttemptsPerModel) {
        continue; // Skip to next model
      }

      const masked = MaskedKey(candidate.key);
      const label = getProviderLabel(candidate.provider);

      console.log(
        `🤖 [one-llm-4-all] Tentando ${label} → ${candidate.model} [${masked}]`
      );

      try {
        // Build messages
        const messages = [
          ...(options.system ? [{ role: "system" as const, content: options.system }] : []),
          { role: "user" as const, content: prompt },
        ];

        const response = await sendChatCompletion(
          candidate.baseUrl,
          candidate.key,
          candidate.model,
          candidate.provider,
          messages,
          options.temperature ?? 0.2,
          options.json ?? false,
        );

        if (response.ok) {
          console.log(`✅ [one-llm-4-all] ${label} → ${candidate.model} — Sucesso!`);
          this.rotation.recordSuccess(candidate);
          return new LLMResponse(response.content, candidate.model, candidate.provider);
        }

        // Handle error status codes
        this.handleHttpError(
          response.status,
          response.rawBody,
          candidate.key,
          candidate.model,
          masked,
        );

        errors.push(`${candidate.model}@${response.status}`);
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err);
        console.error(`❌ [one-llm-4-all] Erro de rede (${candidate.model}): ${errMsg}`);
        errors.push(`${candidate.model}@network`);
      }
    }

    // All candidates exhausted
    console.error(
      `🔥 [one-llm-4-all] Todos os candidatos falharam: ${errors.join(" | ")}`
    );

    // NUNCA retorna erro — resposta de emergência
    return new LLMResponse(
      EMERGENCY_RESPONSE_TEXT,
      mkModelId("all-exhausted"),
      "internal" as ProviderId,
    );
  }

  // =========================================================================
  // ERROR HANDLING
  // =========================================================================

  private handleHttpError(
    status:  number,
    body:    string,
    key:     ApiKey,
    model:   ModelId,
    masked:  string,
  ): void {
    console.error(`❌ [${model}] [${masked}] → ${status}: ${body.substring(0, 120)}`);

    switch (true) {
      case status === 401 || status === 403:
        this.blacklist.blockKey(key);
        break;
      case status === 429:
        this.blacklist.blockCombination(key, model);
        break;
      case status === 404:
        this.blacklist.blockModel(model);
        break;
      default:
        // Unknown error — don't blacklist, just skip
        break;
    }
  }

  // =========================================================================
  // FREE MODEL FETCHING
  // =========================================================================

  private async getFreeModels(): Promise<ModelId[]> {
    // Return from cache if still valid
    if (
      this.freeModelCache &&
      Date.now() - this.freeModelCache.fetchedAt < this.config.freeModelCacheTtlMs
    ) {
      return this.freeModelCache.models.filter(m => !this.blacklist.isModelBlocked(m));
    }

    // Try fetching from OpenRouter API
    for (const key of this.config.openRouterKeys) {
      if (this.blacklist.isKeyBlocked(key)) continue;

      try {
        const res = await fetch("https://openrouter.ai/api/v1/models", {
          headers: { "Authorization": `Bearer ${key}` },
        });

        if (!res.ok) continue;

        const json = await res.json() as {
          data?: Array<{ id: string; pricing?: { prompt?: string } }>;
        };
        const models = json.data ?? [];

        const free = models
          .filter(m => {
            const isFreeById = m.id.endsWith(":free");
            const promptPrice = parseFloat(m.pricing?.prompt ?? "1");
            return isFreeById && promptPrice === 0;
          })
          .map(m => mkModelId(m.id));

        if (free.length > 0) {
          console.log(
            `📡 [one-llm-4-all] Modelos FREE atualizados via API (${free.length} modelos)`
          );
          this.freeModelCache = { models: free, fetchedAt: Date.now() };
          return free.filter(m => !this.blacklist.isModelBlocked(m));
        }
      } catch {
        // Silent — try next key
      }
    }

    // Return cached or emergency fallback list
    if (this.freeModelCache) {
      return this.freeModelCache.models.filter(m => !this.blacklist.isModelBlocked(m));
    }

    const emergencyModels = [
      mkModelId("meta-llama/llama-3.3-70b-instruct:free"),
      mkModelId("google/gemma-2-9b-it:free"),
      mkModelId("mistralai/mistral-7b-instruct:free"),
      mkModelId("qwen/qwen-2.5-72b-instruct:free"),
    ];
    this.freeModelCache = { models: emergencyModels, fetchedAt: Date.now() };
    return emergencyModels;
  }
}
