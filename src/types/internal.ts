import { ProviderConfig } from './config';

// Circuit breaker states
export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

// Key state internal
export interface KeyState {
  index: number;
  key: string;                   // actual API key
  status: 'active' | 'inactive';
  circuitState: CircuitState;
  failureCount: number;          // consecutive final failures
  lastUsed: Date | null;
  markedInactiveAt: Date | null;
  cooldownUntil: Date | null;    // kapan boleh di-retry (circuit breaker)
}

// Provider internal state
export interface ProviderState {
  config: ProviderConfig;
  keys: KeyState[];
  currentKeyIndex: number;       // round-robin pointer
}

// Status response dari getStatus()
export interface GatewayStatus {
  providers: ProviderStatusInfo[];
  totalActive: number;
  totalInactive: number;
}

export interface ProviderStatusInfo {
  id: string;
  priority: number;
  keys: KeyStatusInfo[];
}

export interface KeyStatusInfo {
  index: number;
  status: 'active' | 'inactive';
  failureCount: number;
  lastUsed: string | null;       // ISO string
  markedAt: string | null;       // ISO string, kapan di-mark inactive
}
