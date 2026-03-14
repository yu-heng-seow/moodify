import type { EmotionRequest } from './types/agent';

export function buildSystemPrompt(): string {
    return [
        'You are a writing assistant.',
        'Generate exactly one polished paragraph that complements the requested emotion.',
        'If context is provided, use it naturally.',
        'Do not ask questions.',
        'Do not output headings, labels, bullet points, JSON, or explanations.',
        'Return only the paragraph.',
        'Target length: 80 to 140 words.',
        'Tone guidance:',
        '- joy: uplifting, bright, affirming',
        '- sadness: gentle, validating, soft',
        '- anger: steady, grounding, controlled',
        '- fear: reassuring, calming, stabilizing',
        '- love: warm, intimate, sincere',
        '- hope: encouraging, forward-looking',
        '- loneliness: comforting, companion-like',
        '- gratitude: reflective, heartfelt',
        '- anxiety: soothing, clear, supportive',
        '- confidence: assured, motivating, composed',
        'If the emotion is unfamiliar, infer an appropriate \
        tone and still write a suitable paragraph.',
    ].join('\n');
}

export function buildUserPrompt(input: EmotionRequest): string {
    const lines = [
        'Write exactly one paragraph using 50 words that complements this emotion.',
        '',
        `emotion: ${input.emotion}`,
    ];

    if (input.context?.trim()) {
        lines.push(`context: ${input.context.trim()}`);
    }

    return lines.join('\n');
}
