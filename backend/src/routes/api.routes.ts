const express = require('express');
const {
    getRecommendation,
    getRecommendations,
} = require('../controllers/recommendation.controller');
const { generateEmotionParagraph } = require('../controllers/emotion.controller');

const router = express.Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     SongRecommendation:
 *       type: object
 *       properties:
 *         id:
 *           oneOf:
 *             - type: string
 *             - type: number
 *           example: "123"
 *         title:
 *           type: string
 *           example: "Midnight City"
 *         artist:
 *           type: string
 *           example: "M83"
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           example: ["chill", "electronic", "uplifting"]
 *         streamUrl:
 *           type: string
 *           format: uri
 *           example: "https://signed-url.example.com/audio.mp3"
 *
 *     EmotionParagraphRequest:
 *       type: object
 *       description: Request body validated by EmotionRequestSchema.
 *       additionalProperties: true
 *       example:
 *         emotion: "joy"
 *         topic: "a summer road trip"
 *
 *     EmotionParagraphResponse:
 *       type: object
 *       properties:
 *         output:
 *           type: string
 *           example: "A warm wave of joy spread through the moment as the road opened into the golden evening."
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: "internal error"
 *
 *     ValidationErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: "Invalid request body"
 *         details:
 *           type: object
 *           additionalProperties: true
 */

/**
 * @openapi
 * /recommend:
 *   get:
 *     summary: Get one recommended song by tag
 *     tags:
 *       - Recommendation
 *     parameters:
 *       - in: query
 *         name: tag
 *         required: true
 *         schema:
 *           type: string
 *         description: Tag used to filter songs
 *                  before selecting one random result.
 *         example: chill
 *     responses:
 *       200:
 *         description: A single recommended song.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SongRecommendation'
 *       400:
 *         description: Missing required tag query parameter.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "tag query required"
 *       404:
 *         description: No songs found for the given tag.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "No songs found"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/recommend', getRecommendation);

/**
 * @openapi
 * /recommends:
 *   get:
 *     summary: Get a list of recommended songs
 *     tags:
 *       - Recommendation
 *     parameters:
 *       - in: query
 *         name: tag
 *         required: false
 *         schema:
 *           type: string
 *         description: Optional tag to filter songs. \
 *          If omitted or empty, all songs are returned.
 *         example: chill
 *     responses:
 *       200:
 *         description: A list of songs.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SongRecommendation'
 *       404:
 *         description: No songs found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "No songs found"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/recommends', getRecommendations);

/**
 * @openapi
 * /generate-emotion-paragraph:
 *   post:
 *     summary: Generate an emotion paragraph
 *     tags:
 *       - Emotion
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmotionParagraphRequest'
 *     responses:
 *       200:
 *         description: Emotion paragraph generated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EmotionParagraphResponse'
 *       400:
 *         description: Invalid request body.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       502:
 *         description: Upstream/service generation failure.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to generate paragraph"
 *                 message:
 *                   type: string
 *                   example: "Unknown error"
 */
router.post('/generate-emotion-paragraph', generateEmotionParagraph);

module.exports = router;
