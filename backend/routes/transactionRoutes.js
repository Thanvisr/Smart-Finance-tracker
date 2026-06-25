const express = require('express');
const router = express.Router();
const {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getSummary,
} = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

router.get('/summary', getSummary);
router.get('/', getTransactions);
router.post('/', createTransaction);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

module.exports = router;
