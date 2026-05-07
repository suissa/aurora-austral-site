// ============================================================================
// one-llm-4-all — Blacklist Manager
// ============================================================================
// In-memory blacklist with auto-recovery for rate-limited combinations.
// Models marked 404 are blacklisted for the session.
// Keys marked 401/403 are blacklisted for the session.
// Rate-limited combos (429) auto-recover after cooldown.
// ============================================================================

import {
  type ApiKey,
  type ModelId,
  type CombinationId,
  type BlacklistState,
  MaskedKey,
  CombinationId as mkCombinationId,
} from "./types.js";

export class BlacklistManager {
  private readonly state: BlacklistState = {
    models:       [],
    keys:         [],
    combinations: [],
  };

  private readonly cooldownMs: number;

  constructor(rateLimitCooldownMs: number = 5 * 60 * 1000) {
    this.cooldownMs = rateLimitCooldownMs;
  }

  // -------------------------------------------------------------------------
  // Queries
  // -------------------------------------------------------------------------

  isModelBlocked(model: ModelId): boolean {
    return this.state.models.includes(model);
  }

  isKeyBlocked(key: ApiKey): boolean {
    return this.state.keys.includes(key);
  }

  isBlocked(key: ApiKey, model: ModelId): boolean {
    if (this.isModelBlocked(model)) return true;
    if (this.isKeyBlocked(key)) return true;
    const combo = mkCombinationId(key, model);
    return this.state.combinations.includes(combo);
  }

  /** Returns true when ALL keys for a provider are blacklisted. */
  areAllKeysBlocked(keys: readonly ApiKey[]): boolean {
    return keys.length > 0 && keys.every(k => this.isKeyBlocked(k));
  }

  // -------------------------------------------------------------------------
  // Mutations
  // -------------------------------------------------------------------------

  blockModel(model: ModelId): void {
    if (!this.state.models.includes(model)) {
      this.state.models.push(model);
      console.log(`🚫 [one-llm-4-all] Modelo '${model}' bloqueado nesta sessão.`);
    }
  }

  blockKey(key: ApiKey): void {
    if (!this.state.keys.includes(key)) {
      this.state.keys.push(key);
      console.log(`🚫 [one-llm-4-all] Chave '${MaskedKey(key)}' bloqueada (Auth Error).`);
    }
  }

  blockCombination(key: ApiKey, model: ModelId): void {
    const combo = mkCombinationId(key, model);
    if (!this.state.combinations.includes(combo)) {
      this.state.combinations.push(combo);
      console.log(`🚫 [one-llm-4-all] Combinação '${combo}' em Rate Limit (429).`);
      // Auto-recover after cooldown
      setTimeout(() => {
        this.state.combinations = this.state.combinations.filter(c => c !== combo);
        console.log(`♻️  [one-llm-4-all] Combinação '${combo}' re-habilitada.`);
      }, this.cooldownMs);
    }
  }

  // -------------------------------------------------------------------------
  // Stats
  // -------------------------------------------------------------------------

  get blockedModelCount(): number { return this.state.models.length; }
  get blockedKeyCount(): number { return this.state.keys.length; }
  get blockedCombinationCount(): number { return this.state.combinations.length; }
}
