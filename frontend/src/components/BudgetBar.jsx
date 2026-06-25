export default function BudgetBar({ spent, budget }) {
  if (!budget || budget === 0) return null

  const percentage = Math.min((spent / budget) * 100, 100)
  const remaining = budget - spent
  const isOverBudget = spent > budget

  const barColor = percentage >= 90
    ? 'bg-red-500'
    : percentage >= 70
    ? 'bg-yellow-500'
    : 'bg-green-500'

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">Monthly Budget</h3>
        <span className={`text-sm font-bold ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
          {isOverBudget ? '⚠️ Over budget!' : `₹${remaining.toLocaleString()} left`}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex justify-between mt-2 text-xs text-gray-500">
        <span>Spent: <strong className="text-gray-700">₹{spent.toLocaleString()}</strong></span>
        <span><strong className="text-gray-700">{percentage.toFixed(1)}%</strong> used</span>
        <span>Budget: <strong className="text-gray-700">₹{budget.toLocaleString()}</strong></span>
      </div>
    </div>
  )
}
