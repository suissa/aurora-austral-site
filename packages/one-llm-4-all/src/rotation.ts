// ============================================================================
// one-llm-4-all — Rotation Strategies
// ============================================================================
// Implements the 3 rotation modes:
//   self-rotate    → rotates models; key only changes on quota exhaustion
//   ultra-rotate   → rotates BOTH model AND key every message
//   premium-rotate → paid models first; free OpenRouter as fallback
// ============================================================================

import {
  type ApiKey,
  type ModelId,
  type ProviderId,
  type RotationMode,
  type ProviderConfig,
} from "./types.js";
import { BlacklistManager } from "./blacklist.js";

export interface RotationCandidate {
  readonly provider:  ProviderId;
  readonly model:     ModelId;
  readonly key:       ApiKey;
  readonly baseUrl:   string;
}

interface RotationState {
  modelIndex: number;
  keyIndex:   number;
  /** Track the last key used (for ultra-rotate). */
  lastKeyUsed: ApiKey | null;
  /** Track the last model used (for all modes). */
  lastModelUsed: ModelId | null;
}

export class RotationEngine {
  private readonly state: RotationState = {
    modelIndex:    0,
    keyIndex:      0,
    lastKeyUsed:   null,
    lastModelUsed: null,
  };

  constructor(
    private readonly mode: RotationMode,
    private readonly blacklist: BlacklistManager,
  ) {}

  /**
   * Generates an ordered list of candidates to try for the next message.
   * The list is already filtered (no blacklisted entries) and ordered by
   * the rotation strategy.
   */
  getCandidates(
    premiumProviders: readonly ProviderConfig[],
    freeModels:       readonly ModelId[],
    freeKeys:         readonly ApiKey[],
    freeBaseUrl:      string,
  ): RotationCandidate[] {
    switch (this.mode) {
      case "self-rotate":
        return this.selfRotate(premiumProviders, freeModels, freeKeys, freeBaseUrl);
      case "ultra-rotate":
        return this.ultraRotate(premiumProviders, freeModels, freeKeys, freeBaseUrl);
      case "premium-rotate":
        return this.premiumRotate(premiumProviders, freeModels, freeKeys, freeBaseUrl);
    }
  }

  /**
   * Notifies the engine that a candidate was successfully used so it can
   * update internal counters.
   */
  recordSuccess(candidate: RotationCandidate): void {
    this.state.lastKeyUsed   = candidate.key;
    this.state.lastModelUsed = candidate.model;
    this.state.modelIndex++;
    this.state.keyIndex++;
  }

  // =========================================================================
  // SELF-ROTATE
  // Rotates models on every message.
  // Only rotates key when the current key's quotas are all exhausted.
  // =========================================================================
  private selfRotate(
    premiumProviders: readonly ProviderConfig[],
    freeModels: readonly ModelId[],
    freeKeys: readonly ApiKey[],
    freeBaseUrl: string,
  ): RotationCandidate[] {
    const candidates: RotationCandidate[] = [];

    // Combine all models (premium + free) into a single pool for model rotation
    const allEntries = this.buildAllEntries(premiumProviders, freeModels, freeKeys, freeBaseUrl);

    // Start from the current model index and rotate
    const total = allEntries.length;
    for (let i = 0; i < total; i++) {
      const idx = (this.state.modelIndex + i) % total;
      const entry = allEntries[idx];
      if (!entry) continue;

      // For self-rotate: try all keys for this model before moving on
      const keys = entry.keys;
      for (let k = 0; k < keys.length; k++) {
        const key = keys[k];
        if (!key) continue;
        if (this.blacklist.isBlocked(key, entry.model)) continue;
        candidates.push({
          provider: entry.provider,
          model:    entry.model,
          key,
          baseUrl:  entry.baseUrl,
        });
      }
    }

    // Ensure last model isn't first if we have alternatives
    if (
      candidates.length > 1 &&
      this.state.lastModelUsed &&
      candidates[0]?.model === this.state.lastModelUsed
    ) {
      const first = candidates.shift()!;
      candidates.push(first);
    }

    return candidates;
  }

  // =========================================================================
  // ULTRA-ROTATE
  // Rotates BOTH model AND key on every single message.
  // No two consecutive messages share the same key.
  // =========================================================================
  private ultraRotate(
    premiumProviders: readonly ProviderConfig[],
    freeModels: readonly ModelId[],
    freeKeys: readonly ApiKey[],
    freeBaseUrl: string,
  ): RotationCandidate[] {
    const candidates: RotationCandidate[] = [];
    const allEntries = this.buildAllEntries(premiumProviders, freeModels, freeKeys, freeBaseUrl);

    // Flatten all model+key combinations
    const combos: RotationCandidate[] = [];
    for (const entry of allEntries) {
      for (const key of entry.keys) {
        if (this.blacklist.isBlocked(key, entry.model)) continue;
        combos.push({
          provider: entry.provider,
          model:    entry.model,
          key,
          baseUrl:  entry.baseUrl,
        });
      }
    }

    // Reorder: start from current index, skip anything that matches last key
    const total = combos.length;
    // First pass: different key AND different model than last
    for (let i = 0; i < total; i++) {
      const idx = (this.state.keyIndex + i) % total;
      const c = combos[idx];
      if (!c) continue;
      if (
        this.state.lastKeyUsed && c.key === this.state.lastKeyUsed
      ) continue;
      if (
        this.state.lastModelUsed && c.model === this.state.lastModelUsed
      ) continue;
      candidates.push(c);
    }

    // Second pass: allow same model (but not same key)
    for (let i = 0; i < total; i++) {
      const idx = (this.state.keyIndex + i) % total;
      const c = combos[idx];
      if (!c) continue;
      if (this.state.lastKeyUsed && c.key === this.state.lastKeyUsed) continue;
      if (!candidates.some(x => x.model === c.model && x.key === c.key)) {
        candidates.push(c);
      }
    }

    // Final pass: if we still need options, add remaining
    for (let i = 0; i < total; i++) {
      const idx = (this.state.keyIndex + i) % total;
      const c = combos[idx];
      if (!c) continue;
      if (!candidates.some(x => x.model === c.model && x.key === c.key)) {
        candidates.push(c);
      }
    }

    return candidates;
  }

  // =========================================================================
  // PREMIUM-ROTATE
  // First tries ALL premium/paid models, then falls back to free OpenRouter.
  // =========================================================================
  private premiumRotate(
    premiumProviders: readonly ProviderConfig[],
    freeModels: readonly ModelId[],
    freeKeys: readonly ApiKey[],
    freeBaseUrl: string,
  ): RotationCandidate[] {
    const candidates: RotationCandidate[] = [];

    // Phase 1: Premium providers first (rotate among them)
    const premiumEntries = this.buildPremiumEntries(premiumProviders);
    const pTotal = premiumEntries.length;
    for (let i = 0; i < pTotal; i++) {
      const idx = (this.state.modelIndex + i) % pTotal;
      const entry = premiumEntries[idx];
      if (!entry) continue;
      for (const key of entry.keys) {
        if (this.blacklist.isBlocked(key, entry.model)) continue;
        candidates.push({
          provider: entry.provider,
          model:    entry.model,
          key,
          baseUrl:  entry.baseUrl,
        });
      }
    }

    // Phase 2: Free OpenRouter as fallback
    const freeTotal = freeModels.length;
    for (let i = 0; i < freeTotal; i++) {
      const idx = (this.state.modelIndex + i) % freeTotal;
      const model = freeModels[idx];
      if (!model) continue;
      for (const key of freeKeys) {
        if (this.blacklist.isBlocked(key, model)) continue;
        candidates.push({
          provider: "openrouter" as ProviderId,
          model,
          key,
          baseUrl: freeBaseUrl,
        });
      }
    }

    // Rotate away from last model if possible
    if (
      candidates.length > 1 &&
      this.state.lastModelUsed &&
      candidates[0]?.model === this.state.lastModelUsed
    ) {
      const first = candidates.shift()!;
      candidates.push(first);
    }

    return candidates;
  }

  // =========================================================================
  // Helpers
  // =========================================================================

  private buildAllEntries(
    premiumProviders: readonly ProviderConfig[],
    freeModels: readonly ModelId[],
    freeKeys: readonly ApiKey[],
    freeBaseUrl: string,
  ): Array<{ provider: ProviderId; model: ModelId; keys: readonly ApiKey[]; baseUrl: string }> {
    const entries: Array<{ provider: ProviderId; model: ModelId; keys: readonly ApiKey[]; baseUrl: string }> = [];

    // Premium providers
    for (const p of premiumProviders) {
      for (const model of p.models) {
        entries.push({ provider: p.providerId, model, keys: p.apiKeys, baseUrl: p.baseUrl });
      }
    }

    // Free models from OpenRouter
    for (const model of freeModels) {
      entries.push({ provider: "openrouter" as ProviderId, model, keys: freeKeys, baseUrl: freeBaseUrl });
    }

    return entries;
  }

  private buildPremiumEntries(
    premiumProviders: readonly ProviderConfig[],
  ): Array<{ provider: ProviderId; model: ModelId; keys: readonly ApiKey[]; baseUrl: string }> {
    const entries: Array<{ provider: ProviderId; model: ModelId; keys: readonly ApiKey[]; baseUrl: string }> = [];
    for (const p of premiumProviders) {
      for (const model of p.models) {
        entries.push({ provider: p.providerId, model, keys: p.apiKeys, baseUrl: p.baseUrl });
      }
    }
    return entries;
  }
}
