import { OctopusError } from './base.js';

class GatewayExhaustedError extends OctopusError {
  constructor() {
    super('All providers and keys are exhausted');
  }
}

export { GatewayExhaustedError };
