const { getEmotionParagraph } = require('../services/elastic.service');
const { EmotionRequestSchema } = require('../schema/agentSchema');

export async function generateEmotionParagraph(req: any, res: any) {
    const parsed = EmotionRequestSchema.safeParse(req.body);

    if (!parsed.success) {
        return res.status(400).json({
            error: 'Invalid request body',
            details: parsed.error.flatten(),
        });
    }

    try {
        const output = await getEmotionParagraph(parsed.data);

        return res.status(200).json({
            output,
        });
    } catch (error) {
        console.error('Generation failed:', error);

        return res.status(502).json({
            error: 'Failed to generate paragraph',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}
