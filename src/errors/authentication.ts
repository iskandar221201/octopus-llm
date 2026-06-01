import { OctopusError } from './base.js';

class AuthenticationError extends OctopusError {
  provider: string;
  keyIndex: number;

  constructor(provider: string, keyIndex: number) {
    super(`Authentication failed for ${provider} key #${keyIndex}`);
    this.provider = provider;
    this.keyIndex = keyIndex;
  }
}

export { AuthenticationError };
