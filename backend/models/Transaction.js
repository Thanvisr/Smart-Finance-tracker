const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be positive'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Food & Dining',
        'Shopping',
        'Transportation',
        'Entertainment',
        'Healthcare',
        'Housing',
        'Utilities',
        'Education',
        'Travel',
        'Salary',
        'Freelance',
        'Investment',
        'Other',
      ],
      default: 'Other',
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: [true, 'Transaction type is required'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', transactionSchema);
