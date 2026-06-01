import { OctopusError } from './base';

export class RateLimitError extends OctopusError {
  provider: string;
  retryAfter: number | null;

  constructor(provider: string, retryAfter: number | null = null) {
    super(`Rate limited by ${provider}`);
    this.provider = provider;
    this.retryAfter = retryAfter;
  }
}
