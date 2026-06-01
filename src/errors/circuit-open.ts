import { OctopusError } from './base';

export class CircuitOpenError extends OctopusError {
  provider: string;
  keyIndex: number;
  retryAt: Date;

  constructor(provider: string, keyIndex: number, retryAt: Date) {
    super(`Circuit open for ${provider} key #${keyIndex}, retry at ${retryAt.toISOString()}`);
    this.provider = provider;
    this.keyIndex = keyIndex;
    this.retryAt = retryAt;
  }
}
