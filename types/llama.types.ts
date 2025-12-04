export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface LlamaContext {
  completion: (
    params: CompletionParams,
    callback?: (data: CompletionData) => void
  ) => Promise<CompletionResult>;
  release: () => Promise<void>;
  stopCompletion: () => Promise<void>;
}

export interface InitParams {
  model: string;
  use_mlock?: boolean;
  n_ctx?: number;
  n_batch?: number;
  n_threads?: number;
  n_gpu_layers?: number;
  embedding?: boolean;
  rope_freq_base?: number;
  rope_freq_scale?: number;
}

export interface CompletionParams {
  prompt: string;
  n_predict?: number;
  temperature?: number;
  top_k?: number;
  top_p?: number;
  stop?: string[];
  seed?: number;
  repeat_penalty?: number;
  presence_penalty?: number;
  frequency_penalty?: number;
}

export interface CompletionData {
  token: string;
  completion_probabilities?: Array<{
    tok_str: string;
    prob: number;
  }>;
}

export interface CompletionResult {
  text: string;
  tokens_predicted: number;
  tokens_evaluated: number;
  truncated: boolean;
  stopped_eos: boolean;
  stopped_word: boolean;
  stopped_limit: boolean;
  stopping_word: string;
  timings: {
    prompt_n: number;
    prompt_ms: number;
    prompt_per_token_ms: number;
    prompt_per_second: number;
    predicted_n: number;
    predicted_ms: number;
    predicted_per_token_ms: number;
    predicted_per_second: number;
  };
}

export interface UseLlamaChatReturn {
  generateResponse: (
    prompt: string,
    onToken?: (token: string) => void
  ) => Promise<string>;
  loading: boolean;
  error: string | null;
  isReady: boolean;
}