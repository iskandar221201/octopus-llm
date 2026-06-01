import { OctopusError } from './base.js';

class ProviderError extends OctopusError {
  provider: string;
  originalError: Error;

  constructor(provider: string, originalError: Error) {
    super(`Provider error from ${provider}: ${originalError.message}`);
    this.provider = provider;
    this.originalError = originalError;
  }
}

export { ProviderError };
