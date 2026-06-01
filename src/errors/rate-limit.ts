import { OctopusError } from './base.js';

class RateLimitError extends OctopusError {
  provider: string;
  retryAfter: number | null;  // seconds, dari header Retry-After jika ada

  constructor(provider: string, retryAfter: number | null = null) {
    super(`Rate limited by ${provider}`);
    this.provider = provider;
    this.retryAfter = retryAfter;
  }
}

export { RateLimitError };
