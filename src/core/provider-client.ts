import { OpenAI } from 'openai';
import { ChatMessage } from '../types';
import {
  RateLimitError,
  AuthenticationError,
  TimeoutError,
  ProviderError,
} from '../errors/index';

export interface ProviderClientParams {
  baseURL: string;
  apiKey: string;
  model: string;
  messages: ChatMessage[];
  maxTokens: number;
  temperature: number;
  timeoutMs: number;
  streaming?: boolean;
}

export interface PingParams {
  baseURL: string;
  apiKey: string;
  model: string;
  timeoutMs: number;
}

export class ProviderClient {
  public async sendRequest(params: ProviderClientParams): Promise<string> {
    const openai = new OpenAI({
      baseURL: params.baseURL,
      apiKey: params.apiKey,
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), params.timeoutMs);

    try {
      const response = await openai.chat.completions.create(
        {
          model: params.model,
          messages: params.messages as any,
          max_tokens: params.maxTokens,
          temperature: params.temperature,
          stream: false,
        },
        { signal: controller.signal }
      );

      return response.choices[0]?.message?.content || '';
    } catch (error: any) {
      this.handleError(error, params.timeoutMs);
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  public async sendStreamingRequest(params: ProviderClientParams): Promise<AsyncIterable<string>> {
    const openai = new OpenAI({
      baseURL: params.baseURL,
      apiKey: params.apiKey,
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), params.timeoutMs);

    try {
      const stream = await openai.chat.completions.create(
        {
          model: params.model,
          messages: params.messages as any,
          max_tokens: params.maxTokens,
          temperature: params.temperature,
          stream: true,
        },
        { signal: controller.signal }
      );

      return this.asyncIterableWrapper(stream, timeoutId);
    } catch (error: any) {
      clearTimeout(timeoutId);
      this.handleError(error, params.timeoutMs);
      throw error;
    }
  }

  public async ping(params: PingParams): Promise<boolean> {
    const openai = new OpenAI({
      baseURL: params.baseURL,
      apiKey: params.apiKey,
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), params.timeoutMs);

    try {
      await openai.chat.completions.create(
        {
          model: params.model,
          messages: [{ role: 'user', content: 'hi' }],
          max_tokens: 1,
        },
        { signal: controller.signal }
      );
      return true;
    } catch (error) {
      return false;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private handleError(error: any, timeoutMs: number): never {
    if (error.name === 'AbortError' || error.type === 'abort' || (error.message && error.message.includes('abort'))) {
      throw new TimeoutError('unknown', timeoutMs);
    }

    if (error.status === 429) {
      const retryAfterHeader = error.headers?.['retry-after'];
      const retryAfter = retryAfterHeader ? parseInt(retryAfterHeader, 10) : null;
      throw new RateLimitError('unknown', retryAfter);
    }

    if (error.status === 401 || error.status === 403) {
      throw new AuthenticationError('unknown', 0);
    }

    throw new ProviderError('unknown', error);
  }

  private async *asyncIterableWrapper(stream: AsyncIterable<any>, timeoutId: ReturnType<typeof setTimeout>): AsyncIterable<string> {
    try {
      for await (const chunk of stream) {
        if (chunk.choices[0]?.delta?.content) {
          yield chunk.choices[0].delta.content;
        }
      }
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
