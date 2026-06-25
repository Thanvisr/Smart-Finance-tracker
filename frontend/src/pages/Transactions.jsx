import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchTransactions, deleteTransaction } from '../redux/slices/transactionSlice'
import Modal from '../components/Modal'
import TransactionForm from '../components/TransactionForm'
import Loader from '../components/Loader'

function fmt(n) {
  return '₹' + (n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })
}

const CATEGORY_ICONS = {
  'Food & Dining': '🍽️', 'Shopping': '🛍️', 'Transportation': '🚗',
  'Entertainment': '🎬', 'Healthcare': '🏥', 'Housing': '🏠',
  'Utilities': '💡', 'Education': '📚', 'Travel': '✈️',
  'Salary': '💼', 'Freelance': '💻', 'Investment': '📈', 'Other': '📦',
}

export default function Transactions() {
  const dispatch = useDispatch()
  const { list: transactions, loading } = useSelector((s) => s.transactions)

  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [filterType, setFilterType] = useState('all')
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7))
  const [search, setSearch] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const params = {}
    if (filterMonth) params.month = filterMonth
    if (filterType !== 'all') params.type = filterType
    dispatch(fetchTransactions(params))
  }, [dispatch, filterMonth, filterType])

  const handleEdit = (t) => { setEditItem(t); setShowModal(true) }
  const handleAdd = () => { setEditItem(null); setShowModal(true) }
  const handleClose = () => { setShowModal(false); setEditItem(null) }

  const handleDelete = async () => {
    setDeleting(true)
    await dispatch(deleteTransaction(deleteId))
    setDeleting(false)
    setDeleteId(null)
  }

  // Client-side search filter
  const filtered = transactions.filter((t) =>
    t.description.toLowerCase().includes(search.toLowerCase()) ||
    t.category.toLowerCase().includes(search.toLowerCase())
  )

  const totalIncome = filtered.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpense = filtered.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track all your income and expenses</p>
        </div>
        <button onClick={handleAdd} className="btn-primary flex items-center gap-2">
          <span className="text-lg">+</span> Add Transaction
        </button>
      </div>

      {/* Filters */}
      <div className="card flex flex-wrap gap-3 items-center">
        <input
          type="month"
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          className="input-field w-auto"
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="input-field w-auto"
        >
          <option value="all">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Search description or category..."
          className="input-field flex-1 min-w-48"
        />
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-center">
          <p className="text-xs text-green-600 font-medium uppercase">Income</p>
          <p className="text-lg font-bold text-green-700">{fmt(totalIncome)}</p>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-center">
          <p className="text-xs text-red-600 font-medium uppercase">Expense</p>
          <p className="text-lg font-bold text-red-700">{fmt(totalExpense)}</p>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-center">
          <p className="text-xs text-blue-600 font-medium uppercase">Net</p>
          <p className={`text-lg font-bold ${totalIncome - totalExpense >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
            {fmt(totalIncome - totalExpense)}
          </p>
        </div>
      </div>

      {/* Transaction list */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <Loader text="Loading transactions..." />
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">📭</p>
            <p className="font-medium">No transactions found</p>
            <p className="text-sm mt-1">Add your first transaction to get started</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Description</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((t) => (
                <tr key={t._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${t.type === 'income' ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="font-medium text-gray-800">{t.description}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full text-xs font-medium">
                      {CATEGORY_ICONS[t.category] || '📦'} {t.category}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500">
                    {new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <span className={`font-semibold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(t)}
                        className="px-3 py-1 text-xs bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteId(t._id)}
                        className="px-3 py-1 text-xs bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <Modal title={editItem ? 'Edit Transaction' : 'Add Transaction'} onClose={handleClose}>
          <TransactionForm existing={editItem} onClose={handleClose} />
        </Modal>
      )}

      {/* Delete confirmation Modal */}
      {deleteId && (
        <Modal title="Confirm Delete" onClose={() => setDeleteId(null)}>
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete this transaction? This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1">
              Cancel
            </button>
            <button onClick={handleDelete} disabled={deleting} className="btn-danger flex-1">
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
