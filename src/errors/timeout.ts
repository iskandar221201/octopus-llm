import { OctopusError } from './base';

export class TimeoutError extends OctopusError {
  provider: string;
  timeoutMs: number;

  constructor(provider: string, timeoutMs: number) {
    super(`Request to ${provider} timed out after ${timeoutMs}ms`);
    this.provider = provider;
    this.timeoutMs = timeoutMs;
  }
}
