import { z } from 'zod';

export const EmotionRequestSchema = z.object({
    emotion: z
        .string()
        .trim()
        .min(1, 'emotion is required')
        .max(40, 'emotion is too long')
        .regex(/^[A-Za-z-]+$/, 'emotion must be a single word'),
    context: z.string().trim().max(3000, 'context is too long').optional(),
});
