
import { OneLLMEngine } from '../../packages/one-llm-4-all/src/engine';
import type { ApiKey, OneLLMConfig } from '../../packages/one-llm-4-all/src/types';

// We manually configure the engine since we are in the browser
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

const config: OneLLMConfig = {
  rotationMode: "self-rotate",
  providers: [], // No premium providers for now
  openRouterKeys: [OPENROUTER_API_KEY as unknown as ApiKey],
  freeModelCacheTtlMs: 15 * 60 * 1000,
  rateLimitCooldownMs: 5 * 60 * 1000,
  maxKeyAttemptsPerModel: 3,
};

const engine = new OneLLMEngine(config);

export async function translatePost(text: string, targetLang: string = 'English') {
  const prompt = `Translate the following post text to ${targetLang}. Keep the same tone and format. Only return the translated text.\n\nText: ${text}`;
  
  try {
    const response = await engine.sendPrompt(prompt, {
      system: "You are a professional translator for a tech blog. You must use a technical but accessible tone.",
    });
    return response.getText();
  } catch (error) {
    console.error("AI Error:", error);
    return text; // Fallback to original text
  }
}

export default engine;
