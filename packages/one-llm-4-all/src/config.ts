// ============================================================================
// one-llm-4-all — Configuration Loader
// ============================================================================
// Builds OneLLMConfig from environment variables.
// 
// ENV variables:
//   LLM_ROTATION_MODE          = self-rotate | ultra-rotate | premium-rotate
//   OPENROUTER_API_KEY         = main OpenRouter key
//   OPENROUTER_EXTRA_KEYS      = name1=key1,name2=key2,...
//   
//   # Premium providers (pattern: {PROVIDER}_API_KEY and {PROVIDER}_MODELS)
//   OPENAI_API_KEY             = sk-...
//   OPENAI_MODELS              = gpt-4o,gpt-4o-mini
//   ANTHROPIC_API_KEY          = sk-ant-...
//   ANTHROPIC_MODELS           = claude-sonnet-4-20250514
//   GEMINI_API_KEY             = ...
//   GEMINI_MODELS              = gemini-2.0-flash
//   DEEPSEEK_API_KEY           = ...
//   DEEPSEEK_MODELS            = deepseek-chat,deepseek-reasoner
//   QWEN_API_KEY               = ...
//   QWEN_MODELS                = qwen-max
//   XAI_API_KEY                = ...
//   XAI_MODELS                 = grok-3
//   MISTRAL_API_KEY            = ...
//   MISTRAL_MODELS             = mistral-large-latest
//   GROQ_API_KEY               = ...
//   GROQ_MODELS                = llama-3.3-70b-versatile
//   TOGETHER_API_KEY           = ...
//   TOGETHER_MODELS            = meta-llama/Llama-3.3-70B-Instruct-Turbo
//   FIREWORKS_API_KEY          = ...
//   FIREWORKS_MODELS           = accounts/fireworks/models/llama-v3p3-70b-instruct
//   COHERE_API_KEY             = ...
//   COHERE_MODELS              = command-r-plus
//   PERPLEXITY_API_KEY         = ...
//   PERPLEXITY_MODELS          = sonar-pro
// ============================================================================

import {
  type OneLLMConfig,
  type ProviderConfig,
  type RotationMode,
  type ApiKey,
  type ModelId,
  type ProviderId,
  ApiKey  as mkApiKey,
  ModelId as mkModelId,
  ProviderId as mkProviderId,
} from "./types.js";
import { getProviderBaseUrl } from "./providers.js";

const KNOWN_PREMIUM_PROVIDERS = [
  "openai",
  "anthropic",
  "gemini",
  "deepseek",
  "qwen",
  "xai",
  "mistral",
  "groq",
  "together",
  "fireworks",
  "cohere",
  "perplexity",
] as const;

function parseRotationMode(raw: string | undefined): RotationMode {
  const val = (raw ?? "self-rotate").trim().toLowerCase();
  if (val === "ultra-rotate" || val === "premium-rotate" || val === "self-rotate") {
    return val;
  }
  console.warn(`⚠️  [one-llm-4-all] Modo de rotação desconhecido: "${raw}", usando "self-rotate".`);
  return "self-rotate";
}

function parseApiKeys(raw: string | undefined): ApiKey[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map(s => s.trim())
    .filter(Boolean)
    .map(item => {
      // Support "name=key" format
      const key = item.includes("=") ? item.split("=")[1] ?? "" : item;
      return key.trim();
    })
    .filter(k => k.length >= 8)
    .map(k => mkApiKey(k));
}

function parseModels(raw: string | undefined): ModelId[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map(s => s.trim())
    .filter(Boolean)
    .map(m => mkModelId(m));
}

export function loadConfigFromEnv(): OneLLMConfig {
  const rotationMode = parseRotationMode(process.env["LLM_ROTATION_MODE"]);

  // OpenRouter keys
  const mainKey = process.env["OPENROUTER_API_KEY"]?.trim();
  const extraKeys = parseApiKeys(process.env["OPENROUTER_EXTRA_KEYS"]);
  const openRouterKeys: ApiKey[] = [];
  if (mainKey && mainKey.length >= 8) {
    openRouterKeys.push(mkApiKey(mainKey));
  }
  openRouterKeys.push(...extraKeys.filter(k => !openRouterKeys.includes(k)));

  // Premium providers
  const providers: ProviderConfig[] = [];

  for (const slug of KNOWN_PREMIUM_PROVIDERS) {
    const envPrefix = slug.toUpperCase();
    const keyEnv = process.env[`${envPrefix}_API_KEY`]?.trim();
    const modelsEnv = process.env[`${envPrefix}_MODELS`];

    if (!keyEnv || keyEnv.length < 8) continue;

    const models = parseModels(modelsEnv);
    if (models.length === 0) {
      // If the key is set but no models, use a reasonable default
      const defaultModel = getDefaultModelForProvider(slug);
      if (defaultModel) models.push(mkModelId(defaultModel));
    }

    if (models.length === 0) continue;

    const providerId = mkProviderId(slug);
    providers.push({
      providerId,
      baseUrl:   getProviderBaseUrl(providerId),
      apiKeys:   [mkApiKey(keyEnv)],
      models,
      isPremium: true,
    });
  }

  const config: OneLLMConfig = {
    rotationMode,
    providers,
    openRouterKeys,
    freeModelCacheTtlMs:  15 * 60 * 1000,
    rateLimitCooldownMs:  5 * 60 * 1000,
    maxKeyAttemptsPerModel: 3,
  };

  // Log summary
  const premiumCount = providers.reduce((acc, p) => acc + p.models.length, 0);
  console.log(`🔧 [one-llm-4-all] Configuração carregada:`);
  console.log(`   Modo:       ${rotationMode}`);
  console.log(`   OpenRouter: ${openRouterKeys.length} chave(s)`);
  console.log(`   Premium:    ${providers.length} provedor(es), ${premiumCount} modelo(s)`);
  for (const p of providers) {
    console.log(`     └─ ${p.providerId}: ${p.models.join(", ")}`);
  }

  return config;
}

function getDefaultModelForProvider(slug: string): string | null {
  const defaults: Record<string, string> = {
    openai:     "gpt-4o-mini",
    anthropic:  "claude-sonnet-4-20250514",
    gemini:     "gemini-2.0-flash",
    deepseek:   "deepseek-chat",
    qwen:       "qwen-max",
    xai:        "grok-3-mini",
    mistral:    "mistral-large-latest",
    groq:       "llama-3.3-70b-versatile",
    together:   "meta-llama/Llama-3.3-70B-Instruct-Turbo",
    fireworks:  "accounts/fireworks/models/llama-v3p3-70b-instruct",
    cohere:     "command-r-plus",
    perplexity: "sonar-pro",
  };
  return defaults[slug] ?? null;
}
