"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPrompt = sendPrompt;
const path_1 = __importDefault(require("path"));
class LLMResponse {
    constructor(content) {
        this.content = content;
    }
    getText() {
        return this.content;
    }
    getJSONResponse() {
        try {
            let cleaned = this.content.trim();
            if (cleaned.startsWith("```json")) {
                cleaned = cleaned.replace(/^```json\s*/, "").replace(/\s*```$/, "");
            }
            else if (cleaned.startsWith("```")) {
                cleaned = cleaned.replace(/^```\w*\s*/, "").replace(/\s*```$/, "");
            }
            return JSON.parse(cleaned);
        }
        catch (e) {
            console.error("Failed to parse JSON from LLM content:", this.content);
            return null;
        }
    }
}
const BLACKLIST_FILE = path_1.default.resolve(process.cwd(), "llm-blacklist.json");
const inMemoryBlacklist = { models: [], keys: [], combinations: [] };
function getBlacklist() {
    return inMemoryBlacklist;
}
function saveBlacklist(blacklist) {
    // Disabled disk persistence to avoid cross-session pollution
}
function blacklistModel(model) {
    if (!inMemoryBlacklist.models.includes(model)) {
        inMemoryBlacklist.models.push(model);
        console.log(`🚫 [LLM] Modelo '${model}' pausado nesta sessão.`);
    }
}
function blacklistKey(key) {
    if (!inMemoryBlacklist.keys.includes(key)) {
        inMemoryBlacklist.keys.push(key);
        console.log(`🚫 [LLM] Chave '...${key.slice(-6)}' desativada (Auth Error).`);
    }
}
function blacklistCombination(key, model) {
    const id = `${key.slice(-8)}:${model}`;
    if (!inMemoryBlacklist.combinations.includes(id)) {
        inMemoryBlacklist.combinations.push(id);
        console.log(`🚫 [LLM] Combinação '${id}' em Rate Limit (429).`);
        // Limpar após 5 minutos para tentar de novo
        setTimeout(() => {
            inMemoryBlacklist.combinations = inMemoryBlacklist.combinations.filter(c => c !== id);
        }, 5 * 60 * 1000);
    }
}
function isBlacklisted(key, model) {
    if (inMemoryBlacklist.models.includes(model))
        return true;
    if (inMemoryBlacklist.keys.includes(key))
        return true;
    if (inMemoryBlacklist.combinations.includes(`${key.slice(-8)}:${model}`))
        return true;
    return false;
}
let globalModelIndex = 0;
let cachedFreeModels = null;
let lastCacheTime = 0;
async function getOpenRouterFreeModels() {
    const bl = getBlacklist();
    // Cache de 15 minutos para ser bem dinâmico
    if (cachedFreeModels && (Date.now() - lastCacheTime) < 15 * 60 * 1000) {
        return cachedFreeModels.filter(m => !bl.models.includes(m));
    }
    const keysToTry = [process.env.OPENROUTER_API_KEY, ...EXTRA_API_KEYS].filter(Boolean);
    for (const key of keysToTry) {
        try {
            const maskedKey = `...${key.slice(-6)}`;
            const res = await fetch("https://openrouter.ai/api/v1/models", {
                headers: { "Authorization": `Bearer ${key}` }
            });
            if (!res.ok)
                continue;
            const json = await res.json();
            const models = json.data || [];
            const free = models.filter((m) => {
                const isFreeById = m.id.endsWith(':free');
                const promptPrice = parseFloat(m.pricing?.prompt ?? "1");
                return isFreeById && promptPrice === 0;
            }).map((m) => m.id);
            if (free.length > 0) {
                console.log(`📡 [one-llm-4-all] Modelos FREE atualizados via API (${free.length} modelos)`);
                cachedFreeModels = free;
                lastCacheTime = Date.now();
                return free.filter(m => !bl.models.includes(m));
            }
        }
        catch (err) { }
    }
    // Se TUDO falhar, retorna o que tem no cache ou uma lista mínima de emergência
    return cachedFreeModels || ["meta-llama/llama-3.3-70b-instruct:free", "google/gemma-2-9b-it:free"];
}
let globalKeyIndex = 0;
/**
 * Chaves extras carregadas via OPENROUTER_EXTRA_KEYS no .env.
 * O formato é "nome=chave,nome2=chave2". Extraímos apenas a parte da chave.
 */
const EXTRA_API_KEYS = (process.env.OPENROUTER_EXTRA_KEYS || "")
    .split(",")
    .filter(Boolean)
    .map(item => item.includes("=") ? item.split("=")[1] : item);
async function sendPrompt(prompt, options = {}) {
    const provider = (options.provider || process.env.LLM_PROVIDER || "openrouter").trim().toLowerCase();
    const modelRaw = (options.model || process.env.LLM_MODEL || "meta-llama/llama-3.3-70b-instruct:free").trim();
    const originalKey = (options.apiKey || (provider === "groq" ? process.env.GROQ_API_KEY : process.env.OPENROUTER_API_KEY) || "").trim();
    const allKeys = [...new Set([originalKey, ...(provider === "openrouter" ? EXTRA_API_KEYS : [])].filter(Boolean))];
    try {
        return await executeProviderRequest(provider, modelRaw, allKeys, prompt, options);
    }
    catch (err) {
        if (provider === "openrouter" && process.env.GROQ_API_KEY && !options.apiKey) {
            console.warn("🔄 [LLM] OpenRouter falhou. Tentando fallback para Groq...");
            return await sendPrompt(prompt, {
                ...options,
                provider: "groq",
                model: "llama-3.3-70b-versatile",
                apiKey: process.env.GROQ_API_KEY
            });
        }
        throw err;
    }
}
async function executeProviderRequest(provider, modelRaw, allKeys, prompt, options) {
    const baseUrl = provider === "groq" ? "https://api.groq.com/openai/v1/chat/completions" : "https://openrouter.ai/api/v1/chat/completions";
    let modelsToTry = [];
    if (provider === "openrouter") {
        // Busca OBRIGATORIAMENTE via API conforme pedido
        const apiModels = await getOpenRouterFreeModels();
        // Se o usuário passou um modelo específico via código (options.model), ele tem prioridade, 
        // mas os da API vêm logo depois
        if (options.model) {
            modelsToTry = [options.model, ...apiModels.filter(m => m !== options.model)];
        }
        else {
            modelsToTry = apiModels;
        }
    }
    else {
        modelsToTry = modelRaw.split(',').map(m => m.trim()).filter(Boolean);
    }
    const errors = [];
    for (const model of modelsToTry) {
        if (inMemoryBlacklist.models.includes(model))
            continue;
        let keyAttempts = 0;
        const maxKeyAttempts = Math.min(allKeys.length, 3); // Não queimar todas as chaves num único modelo se estiver instável
        while (keyAttempts < maxKeyAttempts) {
            const key = allKeys[globalKeyIndex % allKeys.length];
            globalKeyIndex++;
            keyAttempts++;
            if (isBlacklisted(key, model))
                continue;
            try {
                const maskedKey = `...${key.slice(-6)}`;
                console.log(`🤖 [one-llm-4-all] Tentando ${model} [${maskedKey}] (${keyAttempts}/${maxKeyAttempts})`);
                const res = await fetch(baseUrl, {
                    method: "POST",
                    headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
                    body: JSON.stringify({
                        model,
                        messages: [...(options.system ? [{ role: "system", content: options.system }] : []), { role: "user", content: prompt }],
                        temperature: options.temperature ?? 0.2,
                        response_format: options.json ? { type: "json_object" } : undefined
                    })
                });
                if (!res.ok) {
                    const body = await res.text();
                    const isAuthError = res.status === 401 || res.status === 403;
                    const isRateLimit = res.status === 429;
                    console.error(`❌ [${model}] [${maskedKey}] -> ${res.status}: ${body.substring(0, 80)}`);
                    if (isAuthError) {
                        blacklistKey(key);
                        continue;
                    }
                    if (isRateLimit) {
                        blacklistCombination(key, model);
                        break;
                    }
                    if (res.status === 404) {
                        blacklistModel(model);
                        break;
                    }
                    errors.push(`${model}@${res.status}`);
                    break; // Outro erro, pula modelo
                }
                const data = await res.json();
                const finalAnswer = data.choices?.[0]?.message?.content || "";
                console.log(`✅ [${model}] Sucesso!`);
                return new LLMResponse(finalAnswer);
            }
            catch (e) {
                console.error(`❌ Erro local (${model}): ${e.message}`);
                break;
            }
        }
    }
    throw new Error(`LLM FAILURE: ${errors.length > 0 ? errors.join(' | ') : 'No valid models or keys available'}`);
}
//# sourceMappingURL=index.js.map