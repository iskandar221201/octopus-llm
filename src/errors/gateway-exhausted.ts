import { OctopusError } from './base';

export class GatewayExhaustedError extends OctopusError {
  constructor() {
    super('All providers and keys are exhausted');
  }
}
