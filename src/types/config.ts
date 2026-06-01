// Provider configuration dari user
export interface ProviderConfig {
  id: string;                    // unique identifier, e.g. 'groq'
  baseURL: string;               // OpenAI-compatible endpoint
  model: string;                 // model name untuk provider ini
  keys: string[];                // array of API keys
  priority: number;              // lower = higher priority
}

// Guard configuration
export interface GuardConfig {
  timeoutMs?: number;            // default: 10000
  maxInputTokens?: number;       // default: 4000
  maxRetries?: number;           // default: 2
  maxOutputTokens?: number;      // default: 1000
}

// Recovery configuration
export interface RecoveryConfig {
  pingInterval?: number;         // seconds, default: 60
  pingTimeout?: number;          // ms, default: 5000
}

// Circuit breaker configuration
export interface CircuitBreakerConfig {
  failureThreshold?: number;     // default: 3
  cooldown?: number;             // seconds, default: 120
}

// Main gateway config
export interface GatewayConfig {
  providers: ProviderConfig[];
  streaming?: boolean;           // default: true
  guard?: GuardConfig;
  recovery?: RecoveryConfig;
  circuitBreaker?: CircuitBreakerConfig;
}
