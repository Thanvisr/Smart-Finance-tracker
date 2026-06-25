const Transaction = require('../models/Transaction');

// @desc    Get all transactions for logged-in user
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res) => {
  try {
    const { month, type } = req.query;
    let filter = { userId: req.user._id };

    // Filter by month if provided (format: YYYY-MM)
    if (month) {
      const [year, mon] = month.split('-');
      const startDate = new Date(year, mon - 1, 1);
      const endDate = new Date(year, mon, 0, 23, 59, 59);
      filter.date = { $gte: startDate, $lte: endDate };
    }

    // Filter by type if provided
    if (type && (type === 'income' || type === 'expense')) {
      filter.type = type;
    }

    const transactions = await Transaction.find(filter).sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create a new transaction
// @route   POST /api/transactions
// @access  Private
const createTransaction = async (req, res) => {
  try {
    const { amount, category, description, type, date } = req.body;

    if (!amount || !category || !description || !type) {
      return res.status(400).json({ message: 'Please fill in all required fields' });
    }

    const transaction = await Transaction.create({
      userId: req.user._id,
      amount,
      category,
      description,
      type,
      date: date || Date.now(),
    });

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update a transaction
// @route   PUT /api/transactions/:id
// @access  Private
const updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Make sure the transaction belongs to the logged-in user
    if (transaction.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this transaction' });
    }

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedTransaction);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete a transaction
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Make sure the transaction belongs to the logged-in user
    if (transaction.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this transaction' });
    }

    await Transaction.findByIdAndDelete(req.params.id);
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get dashboard summary stats
// @route   GET /api/transactions/summary
// @access  Private
const getSummary = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user._id });

    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Category-wise breakdown for expenses
    const categoryBreakdown = {};
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount;
      });

    // Monthly trend (last 6 months)
    const monthlyTrend = {};
    transactions.forEach((t) => {
      const monthKey = new Date(t.date).toLocaleString('default', {
        month: 'short',
        year: 'numeric',
      });
      if (!monthlyTrend[monthKey]) {
        monthlyTrend[monthKey] = { income: 0, expense: 0 };
      }
      monthlyTrend[monthKey][t.type] += t.amount;
    });

    res.json({
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      categoryBreakdown,
      monthlyTrend,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getSummary,
};
