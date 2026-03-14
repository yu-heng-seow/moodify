export interface EmotionRequest {
    emotion: string;
    context?: string;
}

export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface ElasticChatCompletionStreamRequest {
    messages: ChatMessage[];
}

export interface ElasticStreamDelta {
    content?: string;
}

export interface ElasticStreamChoice {
    delta?: ElasticStreamDelta;
    message?: {
        content?: string;
    };
}

export interface ElasticStreamChunk {
    choices?: ElasticStreamChoice[];
    [key: string]: unknown;
}
