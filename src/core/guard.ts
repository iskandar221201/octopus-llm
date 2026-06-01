import { GuardConfig, ChatMessage } from '../types';
import { estimateTokens } from '../utils/token-estimator';
import { InputTooLongError } from '../errors/input-too-long';

export class Guard {
  private config: Required<GuardConfig>;

  constructor(config: GuardConfig = {}) {
    this.config = {
      timeoutMs: config.timeoutMs ?? 10000,
      maxInputTokens: config.maxInputTokens ?? 4000,
      maxRetries: config.maxRetries ?? 2,
      maxOutputTokens: config.maxOutputTokens ?? 1000,
    };
  }

  public validateInput(messages: ChatMessage[]): void {
    const text = messages.map(m => m.content).join('\n');
    const tokens = estimateTokens(text);
    if (tokens > this.config.maxInputTokens) {
      throw new InputTooLongError(tokens, this.config.maxInputTokens);
    }
  }

  public getTimeoutMs(): number {
    return this.config.timeoutMs;
  }

  public getMaxRetries(): number {
    return this.config.maxRetries;
  }

  public getMaxOutputTokens(): number {
    return this.config.maxOutputTokens;
  }
}
