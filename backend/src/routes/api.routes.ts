const express = require('express');
const {
    getRecommendation,
    getRecommendations,
} = require('../controllers/recommendation.controller');
const { generateEmotionParagraph } = require('../controllers/emotion.controller');

const router = express.Router();

router.get('/recommend', getRecommendation);
router.get('/recommends', getRecommendations);
router.post('/generate-emotion-paragraph', generateEmotionParagraph);

module.exports = router;
