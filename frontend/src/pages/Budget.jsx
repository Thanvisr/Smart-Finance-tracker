import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchBudget, setBudget, clearMessages } from '../redux/slices/budgetSlice'
import { fetchTransactions } from '../redux/slices/transactionSlice'
import BudgetBar from '../components/BudgetBar'
import Loader from '../components/Loader'

function fmt(n) {
  return '₹' + (n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })
}

export default function Budget() {
  const dispatch = useDispatch()
  const { current: budget, loading, error, successMessage } = useSelector((s) => s.budget)
  const { list: transactions } = useSelector((s) => s.transactions)

  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7))
  const [amount, setAmount] = useState('')

  useEffect(() => {
    dispatch(fetchBudget(month))
    dispatch(fetchTransactions({ month }))
  }, [dispatch, month])

  useEffect(() => {
    if (budget?.budgetAmount) {
      setAmount(budget.budgetAmount)
    } else {
      setAmount('')
    }
  }, [budget])

  useEffect(() => {
    if (successMessage) {
      const t = setTimeout(() => dispatch(clearMessages()), 3000)
      return () => clearTimeout(t)
    }
  }, [successMessage, dispatch])

  const handleSave = (e) => {
    e.preventDefault()
    if (!amount || parseFloat(amount) < 0) return
    dispatch(setBudget({ month, budgetAmount: parseFloat(amount) }))
  }

  // Build category-wise expense breakdown for the selected month
  const expenseByCategory = {}
  transactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount
    })

  const totalExpenses = Object.values(expenseByCategory).reduce((s, v) => s + v, 0)
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0)

  const CATEGORY_ICONS = {
    'Food & Dining': '🍽️', 'Shopping': '🛍️', 'Transportation': '🚗',
    'Entertainment': '🎬', 'Healthcare': '🏥', 'Housing': '🏠',
    'Utilities': '💡', 'Education': '📚', 'Travel': '✈️',
    'Salary': '💼', 'Freelance': '💻', 'Investment': '📈', 'Other': '📦',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Budget Planner</h1>
        <p className="text-sm text-gray-500 mt-0.5">Set and track your monthly spending limits</p>
      </div>

      {/* Month selector + form */}
      <div className="card">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Set Monthly Budget</h2>

        {successMessage && (
          <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-lg border border-green-200 mb-4">
            ✅ {successMessage}
          </div>
        )}
        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg border border-red-200 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="input-field w-auto"
            />
          </div>
          <div className="flex-1 min-w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">Budget Amount (₹)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 30000"
              min="0"
              step="100"
              className="input-field"
              required
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary py-2 px-6">
            {loading ? 'Saving...' : budget?.exists ? 'Update Budget' : 'Set Budget'}
          </button>
        </form>
      </div>

      {/* Budget progress */}
      {loading ? (
        <Loader text="Loading budget..." />
      ) : budget?.budgetAmount > 0 ? (
        <>
          <BudgetBar spent={totalExpenses} budget={budget.budgetAmount} />

          {/* Stats row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="card text-center">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Budget</p>
              <p className="text-2xl font-bold text-blue-700">{fmt(budget.budgetAmount)}</p>
            </div>
            <div className="card text-center">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Total Spent</p>
              <p className="text-2xl font-bold text-red-600">{fmt(totalExpenses)}</p>
            </div>
            <div className="card text-center">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Remaining</p>
              <p className={`text-2xl font-bold ${budget.budgetAmount - totalExpenses >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                {fmt(budget.budgetAmount - totalExpenses)}
              </p>
            </div>
          </div>
        </>
      ) : (
        <div className="card text-center py-10 text-gray-400">
          <p className="text-4xl mb-3">🎯</p>
          <p className="font-medium text-gray-600">No budget set for this month</p>
          <p className="text-sm mt-1">Set a budget above to start tracking your spending</p>
        </div>
      )}

      {/* Income summary */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-800">Monthly Income</h2>
          <span className="text-green-600 font-bold">{fmt(totalIncome)}</span>
        </div>
        {totalIncome > 0 && budget?.budgetAmount > 0 && (
          <p className="text-sm text-gray-500">
            Your budget is{' '}
            <strong className={budget.budgetAmount <= totalIncome ? 'text-green-600' : 'text-red-600'}>
              {budget.budgetAmount <= totalIncome ? 'within' : 'exceeding'} your income
            </strong>{' '}
            for this month. {budget.budgetAmount <= totalIncome
              ? `You plan to save ${fmt(totalIncome - budget.budgetAmount)}.`
              : `Consider reducing your budget by ${fmt(budget.budgetAmount - totalIncome)}.`}
          </p>
        )}
      </div>

      {/* Category breakdown */}
      {Object.keys(expenseByCategory).length > 0 && (
        <div className="card">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Expense Breakdown by Category</h2>
          <div className="space-y-3">
            {Object.entries(expenseByCategory)
              .sort((a, b) => b[1] - a[1])
              .map(([cat, amount]) => {
                const pct = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0
                return (
                  <div key={cat}>
                    <div className="flex justify-between items-center mb-1 text-sm">
                      <span className="flex items-center gap-2 text-gray-700 font-medium">
                        {CATEGORY_ICONS[cat] || '📦'} {cat}
                      </span>
                      <span className="text-gray-600">
                        {fmt(amount)} <span className="text-gray-400 text-xs">({pct.toFixed(1)}%)</span>
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      )}
    </div>
  )
}
