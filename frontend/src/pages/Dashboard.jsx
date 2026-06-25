import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import ReactApexChart from 'react-apexcharts'
import { fetchSummary, fetchTransactions } from '../redux/slices/transactionSlice'
import { fetchBudget } from '../redux/slices/budgetSlice'
import { aiService } from '../services/aiService'
import StatCard from '../components/StatCard'
import BudgetBar from '../components/BudgetBar'
import Loader from '../components/Loader'

function fmt(n) {
  return '₹' + (n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })
}

export default function Dashboard() {
  const dispatch = useDispatch()
  const { summary, list: transactions, loading } = useSelector((s) => s.transactions)
  const { current: budget } = useSelector((s) => s.budget)
  const { user } = useSelector((s) => s.auth)

  const [insights, setInsights] = useState('')
  const [insightsLoading, setInsightsLoading] = useState(false)

  const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM

  useEffect(() => {
    dispatch(fetchSummary())
    dispatch(fetchTransactions({ month: currentMonth }))
    dispatch(fetchBudget(currentMonth))
  }, [dispatch, currentMonth])

  const loadInsights = async () => {
    setInsightsLoading(true)
    try {
      const result = await aiService.getInsights(transactions, currentMonth)
      setInsights(result.insights)
    } catch {
      setInsights('Could not load insights. Please try again.')
    } finally {
      setInsightsLoading(false)
    }
  }

  // ── Chart data ──────────────────────────────────────────────

  // Pie chart: category-wise expenses
  const categoryData = summary?.categoryBreakdown || {}
  const pieLabels = Object.keys(categoryData)
  const pieSeries = Object.values(categoryData)

  const pieOptions = {
    chart: { type: 'pie', toolbar: { show: false } },
    labels: pieLabels,
    legend: { position: 'bottom', fontSize: '12px' },
    colors: ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316','#84cc16','#ec4899','#6b7280'],
    dataLabels: { enabled: true, formatter: (val) => `${val.toFixed(1)}%` },
    tooltip: { y: { formatter: (val) => fmt(val) } },
    plotOptions: { pie: { expandOnClick: true } },
  }

  // Bar chart: monthly income vs expense
  const monthlyData = summary?.monthlyTrend || {}
  const sortedMonths = Object.keys(monthlyData).slice(-6)
  const barOptions = {
    chart: { type: 'bar', toolbar: { show: false }, stacked: false },
    xaxis: { categories: sortedMonths, labels: { style: { fontSize: '11px' } } },
    yaxis: { labels: { formatter: (v) => '₹' + v.toLocaleString('en-IN') } },
    colors: ['#10b981', '#ef4444'],
    legend: { position: 'top' },
    dataLabels: { enabled: false },
    plotOptions: { bar: { borderRadius: 6, columnWidth: '55%' } },
    tooltip: { y: { formatter: (v) => fmt(v) } },
  }
  const barSeries = [
    { name: 'Income', data: sortedMonths.map((m) => monthlyData[m]?.income || 0) },
    { name: 'Expense', data: sortedMonths.map((m) => monthlyData[m]?.expense || 0) },
  ]

  if (loading && !summary) return <Loader text="Loading dashboard..." />

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Welcome back, <strong>{user?.name}</strong>! Here's your financial overview.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Income" value={fmt(summary?.totalIncome)} icon="📥" color="green" />
        <StatCard title="Total Expense" value={fmt(summary?.totalExpense)} icon="📤" color="red" />
        <StatCard
          title="Net Balance"
          value={fmt(summary?.balance)}
          icon="💼"
          color={summary?.balance >= 0 ? 'blue' : 'red'}
          subtitle={summary?.balance >= 0 ? 'You are in profit' : 'You are in deficit'}
        />
      </div>

      {/* Budget bar */}
      {budget?.budgetAmount > 0 && (
        <BudgetBar spent={budget.totalExpenses || 0} budget={budget.budgetAmount} />
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie chart */}
        <div className="card">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Expenses by Category</h2>
          {pieLabels.length > 0 ? (
            <ReactApexChart
              type="pie"
              options={pieOptions}
              series={pieSeries}
              height={300}
            />
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
              No expense data yet
            </div>
          )}
        </div>

        {/* Bar chart */}
        <div className="card">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Monthly Income vs Expenses</h2>
          {sortedMonths.length > 0 ? (
            <ReactApexChart
              type="bar"
              options={barOptions}
              series={barSeries}
              height={300}
            />
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
              No monthly data yet
            </div>
          )}
        </div>
      </div>

      {/* AI Insights */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🤖</span>
            <h2 className="text-base font-semibold text-gray-800">AI Financial Insights</h2>
          </div>
          <button
            onClick={loadInsights}
            disabled={insightsLoading}
            className="px-4 py-1.5 bg-purple-100 text-purple-700 text-sm font-medium rounded-lg hover:bg-purple-200 transition-colors disabled:opacity-50"
          >
            {insightsLoading ? 'Analyzing...' : insights ? 'Refresh' : 'Get Insights'}
          </button>
        </div>

        {insightsLoading ? (
          <div className="flex items-center gap-3 text-sm text-gray-500 py-3">
            <span className="w-4 h-4 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
            Analyzing your transactions...
          </div>
        ) : insights ? (
          <p className="text-gray-700 text-sm leading-relaxed bg-purple-50 rounded-lg p-4 border border-purple-100">
            {insights}
          </p>
        ) : (
          <p className="text-gray-400 text-sm italic">
            Click "Get Insights" to receive AI-powered analysis of your spending patterns.
          </p>
        )}
      </div>

      {/* Recent transactions */}
      <div className="card">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Recent Transactions (This Month)</h2>
        {transactions.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">No transactions this month.</p>
        ) : (
          <div className="space-y-2">
            {transactions.slice(0, 5).map((t) => (
              <div
                key={t._id}
                className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">
                    {t.type === 'income' ? '📥' : '📤'}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{t.description}</p>
                    <p className="text-xs text-gray-400">
                      {t.category} · {new Date(t.date).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                </div>
                <span className={`text-sm font-semibold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
