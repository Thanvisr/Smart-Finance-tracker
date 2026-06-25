const express = require('express');
const router = express.Router();
const { categorizeExpense, getInsights } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/categorize', categorizeExpense);
router.post('/insights', getInsights);

module.exports = router;
