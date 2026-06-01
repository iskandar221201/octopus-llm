import { OctopusError } from './base';

export class InputTooLongError extends OctopusError {
  estimated: number;
  limit: number;

  constructor(estimated: number, limit: number) {
    super(`Input too long: estimated ${estimated} tokens, limit is ${limit}`);
    this.estimated = estimated;
    this.limit = limit;
  }
}
