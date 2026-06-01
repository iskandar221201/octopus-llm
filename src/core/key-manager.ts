import { ProviderConfig, CircuitBreakerConfig } from '../types/config';
import { ProviderState, KeyState, GatewayStatus, CircuitState } from '../types/internal';

export class KeyManager {
  private providerStates: ProviderState[];
  private circuitBreakerConfig: CircuitBreakerConfig;

  constructor(providers: ProviderConfig[], circuitBreakerConfig: CircuitBreakerConfig = {}) {
    // Sort providers by priority ascending (lower is higher priority)
    const sortedProviders = [...providers].sort((a, b) => a.priority - b.priority);

    this.providerStates = sortedProviders.map(config => ({
      config,
      currentKeyIndex: 0,
      keys: config.keys.map((key, index) => ({
        index,
        key,
        status: 'active',
        circuitState: 'CLOSED' as CircuitState,
        failureCount: 0,
        lastUsed: null,
        markedInactiveAt: null,
        cooldownUntil: null
      }))
    }));

    this.circuitBreakerConfig = {
      failureThreshold: circuitBreakerConfig.failureThreshold ?? 3,
      cooldown: circuitBreakerConfig.cooldown ?? 120
    };
  }

  public getNextKey(forceProvider?: string): { provider: ProviderConfig, key: KeyState } | null {
    // If a provider is forced, only look at that provider
    let providersToSearch = this.providerStates;
    if (forceProvider) {
      providersToSearch = this.providerStates.filter(p => p.config.id === forceProvider);
      if (providersToSearch.length === 0) {
        return null;
      }
    }

    for (const providerState of providersToSearch) {
      const { keys } = providerState;
      if (keys.length === 0) continue;

      // Try to find an active key in round-robin fashion
      let attempts = 0;
      const totalKeys = keys.length;

      while (attempts < totalKeys) {
        const currentKey = keys[providerState.currentKeyIndex];
        
        // Move to the next index immediately for round-robin
        providerState.currentKeyIndex = (providerState.currentKeyIndex + 1) % totalKeys;

        if (currentKey.status === 'active') {
          currentKey.lastUsed = new Date();
          return {
            provider: providerState.config,
            key: currentKey
          };
        }

        attempts++;
      }
    }

    // All priority levels exhausted or no active keys
    return null;
  }

  public recordFailure(providerId: string, keyIndex: number): void {
    const keyState = this.findKeyState(providerId, keyIndex);
    if (!keyState) return;

    keyState.failureCount += 1;

    const threshold = this.circuitBreakerConfig.failureThreshold ?? 3;
    if (keyState.failureCount >= threshold) {
      keyState.status = 'inactive';
      keyState.circuitState = 'OPEN';
      keyState.markedInactiveAt = new Date();
      
      const cooldownSeconds = this.circuitBreakerConfig.cooldown ?? 120;
      const cooldownUntil = new Date();
      cooldownUntil.setSeconds(cooldownUntil.getSeconds() + cooldownSeconds);
      keyState.cooldownUntil = cooldownUntil;
    }
  }

  public recordSuccess(providerId: string, keyIndex: number): void {
    const keyState = this.findKeyState(providerId, keyIndex);
    if (!keyState) return;

    keyState.failureCount = 0;
    keyState.circuitState = 'CLOSED';
    keyState.status = 'active';
    keyState.cooldownUntil = null;
    keyState.markedInactiveAt = null;
  }

  public reactivateKey(providerId: string, keyIndex: number): void {
    const keyState = this.findKeyState(providerId, keyIndex);
    if (!keyState) return;

    keyState.status = 'active';
    keyState.circuitState = 'CLOSED';
    keyState.failureCount = 0;
    keyState.markedInactiveAt = null;
    keyState.cooldownUntil = null;
  }

  public markHalfOpen(providerId: string, keyIndex: number): void {
    const keyState = this.findKeyState(providerId, keyIndex);
    if (!keyState) return;

    keyState.circuitState = 'HALF_OPEN';
  }

  public getInactiveKeys(): Array<{ providerId: string, keyIndex: number, key: KeyState }> {
    const now = new Date();
    const result: Array<{ providerId: string, keyIndex: number, key: KeyState }> = [];

    for (const providerState of this.providerStates) {
      for (const key of providerState.keys) {
        if (key.status === 'inactive' && key.cooldownUntil && key.cooldownUntil <= now) {
          result.push({
            providerId: providerState.config.id,
            keyIndex: key.index,
            key
          });
        }
      }
    }

    return result;
  }

  public getStatus(): GatewayStatus {
    let totalActive = 0;
    let totalInactive = 0;

    const providers = this.providerStates.map(providerState => {
      const keys = providerState.keys.map(key => {
        if (key.status === 'active') {
          totalActive++;
        } else {
          totalInactive++;
        }

        return {
          index: key.index,
          status: key.status,
          failureCount: key.failureCount,
          lastUsed: key.lastUsed ? key.lastUsed.toISOString() : null,
          markedAt: key.markedInactiveAt ? key.markedInactiveAt.toISOString() : null
        };
      });

      return {
        id: providerState.config.id,
        priority: providerState.config.priority,
        keys
      };
    });

    return {
      providers,
      totalActive,
      totalInactive
    };
  }

  private findKeyState(providerId: string, keyIndex: number): KeyState | null {
    const providerState = this.providerStates.find(p => p.config.id === providerId);
    if (!providerState) return null;

    const keyState = providerState.keys.find(k => k.index === keyIndex);
    return keyState || null;
  }
}
