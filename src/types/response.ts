// Metadata yang ada di response dan stream
export interface ResponseMetadata {
  provider: string;              // provider id yang digunakan
  keyIndex: number;              // index key yang digunakan
  latencyMs: number;             // total latency in ms
  model: string;                 // model yang digunakan
  attempts: number;              // jumlah percobaan
  fallbackUsed: boolean;         // true jika pindah provider
}

// Non-streaming response
export interface ChatResponse extends ResponseMetadata {
  content: string;               // full response content
}

// Streaming chunk
export interface StreamChunk {
  delta: string;                 // token content
}

// Streaming response — async iterable + metadata setelah selesai
export interface StreamResponse extends AsyncIterable<StreamChunk>, ResponseMetadata {}

// Chat options per-call
export interface ChatOptions {
  streaming?: boolean;           // override default
  maxTokens?: number;            // default: 1000
  temperature?: number;          // default: 0.7
  forceProvider?: string;        // bypass rotation
}

// Message format (OpenAI-compatible)
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}
