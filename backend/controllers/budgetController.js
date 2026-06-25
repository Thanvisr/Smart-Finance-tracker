const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');

// @desc    Get budget for a specific month
// @route   GET /api/budget?month=YYYY-MM
// @access  Private
const getBudget = async (req, res) => {
  try {
    const { month } = req.query;

    if (!month) {
      return res.status(400).json({ message: 'Month parameter is required (format: YYYY-MM)' });
    }

    const budget = await Budget.findOne({ userId: req.user._id, month });

    if (!budget) {
      return res.json({ budgetAmount: 0, month, exists: false });
    }

    // Calculate total expenses for the month
    const [year, mon] = month.split('-');
    const startDate = new Date(year, mon - 1, 1);
    const endDate = new Date(year, mon, 0, 23, 59, 59);

    const transactions = await Transaction.find({
      userId: req.user._id,
      type: 'expense',
      date: { $gte: startDate, $lte: endDate },
    });

    const totalExpenses = transactions.reduce((sum, t) => sum + t.amount, 0);
    const remaining = budget.budgetAmount - totalExpenses;

    res.json({
      ...budget.toObject(),
      totalExpenses,
      remaining,
      exists: true,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Set or update budget for a month
// @route   POST /api/budget
// @access  Private
const setBudget = async (req, res) => {
  try {
    const { month, budgetAmount } = req.body;

    if (!month || budgetAmount === undefined) {
      return res.status(400).json({ message: 'Month and budget amount are required' });
    }

    if (budgetAmount < 0) {
      return res.status(400).json({ message: 'Budget amount must be positive' });
    }

    // Upsert: create if not exists, update if exists
    const budget = await Budget.findOneAndUpdate(
      { userId: req.user._id, month },
      { budgetAmount },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json(budget);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all budgets for a user
// @route   GET /api/budget/all
// @access  Private
const getAllBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ userId: req.user._id }).sort({ month: -1 });
    res.json(budgets);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getBudget, setBudget, getAllBudgets };
