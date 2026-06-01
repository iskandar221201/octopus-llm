export class OctopusError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OctopusError';
  }
}
