const { Client } = require('@elastic/elasticsearch');
import { env } from '../config/env';
import { buildSystemPrompt, buildUserPrompt } from '../prompt';
import type {
    ElasticChatCompletionStreamRequest,
    ElasticStreamChunk,
    EmotionRequest,
} from '../types/agent';
import { SongDocument } from '../types/song';

const elasticClient = new Client({
    node: env.elasticNode,
    auth: {
        apiKey: env.elasticApiKey,
    },
});

function getStreamEndpointUrl(): string {
    return (
        `${env.elasticNode}/_inference/chat_completion/` +
        `${encodeURIComponent(env.elasticInferenceId)}/_stream`
    );
}

function parseSseDataLines(raw: string): string[] {
    const lines = raw.split(/\r?\n/);
    const dataLines: string[] = [];

    for (const line of lines) {
        if (line.startsWith('data:')) {
            dataLines.push(line.slice(5).trim());
        }
    }

    return dataLines;
}

function extractTextFromChunk(chunk: ElasticStreamChunk): string {
    const choice = chunk.choices?.[0];
    if (!choice) return '';

    if (typeof choice.delta?.content === 'string') {
        return choice.delta.content;
    }

    if (typeof choice.message?.content === 'string') {
        return choice.message.content;
    }

    return '';
}

export async function getEmotionParagraph(input: EmotionRequest): Promise<string> {
    const payload: ElasticChatCompletionStreamRequest = {
        messages: [
            {
                role: 'system',
                content: buildSystemPrompt(),
            },
            {
                role: 'user',
                content: buildUserPrompt(input),
            },
        ],
    };

    const response = await fetch(getStreamEndpointUrl(), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `ApiKey ${env.elasticApiKey}`,
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Elastic inference failed with status ${response.status}: ${errorText}`);
    }

    if (!response.body) {
        throw new Error('Elastic returned no response body.');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let output = '';

    while (true) {
        const { value, done } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const events = buffer.split('\n\n');
        buffer = events.pop() ?? '';

        for (const event of events) {
            const dataLines = parseSseDataLines(event);

            for (const data of dataLines) {
                if (!data || data === '[DONE]') {
                    continue;
                }

                try {
                    const parsed = JSON.parse(data) as ElasticStreamChunk;
                    output += extractTextFromChunk(parsed);
                } catch {
                    // ignore malformed partial event payloads
                }
            }
        }
    }

    if (buffer.trim()) {
        const dataLines = parseSseDataLines(buffer);

        for (const data of dataLines) {
            if (!data || data === '[DONE]') continue;

            try {
                const parsed = JSON.parse(data) as ElasticStreamChunk;
                output += extractTextFromChunk(parsed);
            } catch {
                // ignore trailing malformed chunk
            }
        }
    }

    const finalText = output.trim();

    if (!finalText) {
        throw new Error('Elastic stream completed but no text was generated.');
    }

    return finalText;
}

async function findSongsByTag(tag: string): Promise<SongDocument[]> {
    const result = await elasticClient.search({
        index: env.musicIndex,
        size: 10,
        query: {
            bool: {
                filter: [
                    {
                        term: {
                            tags: tag.toLowerCase(),
                        },
                    },
                ],
            },
        },
        sort: [{ popularity: 'desc' }],
    });

    return result.hits.hits.map((hit: any) => hit._source);
}

async function findAllSongs(): Promise<SongDocument[]> {
    const result = await elasticClient.search({
        index: env.musicIndex,
        size: 50,
        query: {
            match_all: {},
        },
    });

    return result.hits.hits.map((hit: any) => hit._source as SongDocument);
}

module.exports = {
    elasticClient,
    getStreamEndpointUrl,
    extractTextFromChunk,
    getEmotionParagraph,
    findSongsByTag,
    findAllSongs,
};
