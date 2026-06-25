const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    month: {
      // Format: "YYYY-MM" e.g. "2024-01"
      type: String,
      required: [true, 'Month is required'],
    },
    budgetAmount: {
      type: Number,
      required: [true, 'Budget amount is required'],
      min: [0, 'Budget must be a positive number'],
    },
  },
  { timestamps: true }
);

// Each user can only have one budget per month
budgetSchema.index({ userId: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);
