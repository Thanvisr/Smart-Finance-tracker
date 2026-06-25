const express = require('express');
const router = express.Router();
const { getBudget, setBudget, getAllBudgets } = require('../controllers/budgetController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/all', getAllBudgets);
router.get('/', getBudget);
router.post('/', setBudget);

module.exports = router;
