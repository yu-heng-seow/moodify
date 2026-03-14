const express = require('express');
const { getRecommendation } = require('../controllers/recommendation.controller');

const router = express.Router();

router.get('/recommend', getRecommendation);

module.exports = router;
