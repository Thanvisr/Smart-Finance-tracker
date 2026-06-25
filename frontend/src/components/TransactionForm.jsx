import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { createTransaction, updateTransaction } from '../redux/slices/transactionSlice'
import { aiService } from '../services/aiService'

const CATEGORIES = [
  'Food & Dining', 'Shopping', 'Transportation', 'Entertainment',
  'Healthcare', 'Housing', 'Utilities', 'Education', 'Travel',
  'Salary', 'Freelance', 'Investment', 'Other',
]

const defaultForm = {
  description: '',
  amount: '',
  category: 'Other',
  type: 'expense',
  date: new Date().toISOString().split('T')[0],
}

export default function TransactionForm({ existing, onClose }) {
  const dispatch = useDispatch()
  const [form, setForm] = useState(defaultForm)
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [error, setError] = useState('')

  // Pre-fill form when editing
  useEffect(() => {
    if (existing) {
      setForm({
        description: existing.description,
        amount: existing.amount,
        category: existing.category,
        type: existing.type,
        date: new Date(existing.date).toISOString().split('T')[0],
      })
    }
  }, [existing])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  // AI auto-categorize from description
  const handleAICategorize = async () => {
    if (!form.description.trim()) return
    setAiLoading(true)
    try {
      const result = await aiService.categorize(form.description)
      setForm((prev) => ({ ...prev, category: result.category }))
    } catch {
      // silently fail, user can pick manually
    } finally {
      setAiLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.description || !form.amount || !form.date) {
      setError('Please fill in all fields.')
      return
    }
    if (parseFloat(form.amount) <= 0) {
      setError('Amount must be greater than 0.')
      return
    }

    setLoading(true)
    try {
      const payload = { ...form, amount: parseFloat(form.amount) }
      if (existing) {
        await dispatch(updateTransaction({ id: existing._id, data: payload })).unwrap()
      } else {
        await dispatch(createTransaction(payload)).unwrap()
      }
      onClose()
    } catch (err) {
      setError(err || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {/* Description + AI button */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <div className="flex gap-2">
          <input
            type="text"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="e.g. Dinner at restaurant"
            className="input-field"
            required
          />
          <button
            type="button"
            onClick={handleAICategorize}
            disabled={aiLoading || !form.description.trim()}
            title="Auto-categorize using AI"
            className="flex-shrink-0 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {aiLoading ? '⏳' : '🤖 AI'}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-1">Click 🤖 AI to auto-detect category</p>
      </div>

      {/* Amount */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
        <input
          type="number"
          name="amount"
          value={form.amount}
          onChange={handleChange}
          placeholder="0.00"
          min="0.01"
          step="0.01"
          className="input-field"
          required
        />
      </div>

      {/* Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
        <div className="flex gap-3">
          {['expense', 'income'].map((t) => (
            <label
              key={t}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border-2 cursor-pointer transition-colors text-sm font-medium capitalize ${
                form.type === t
                  ? t === 'expense'
                    ? 'border-red-400 bg-red-50 text-red-700'
                    : 'border-green-400 bg-green-50 text-green-700'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="type"
                value={t}
                checked={form.type === t}
                onChange={handleChange}
                className="hidden"
              />
              {t === 'expense' ? '📤' : '📥'} {t}
            </label>
          ))}
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <select name="category" value={form.category} onChange={handleChange} className="input-field">
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          className="input-field"
          required
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="btn-secondary flex-1">
          Cancel
        </button>
        <button type="submit" disabled={loading} className="btn-primary flex-1">
          {loading ? 'Saving...' : existing ? 'Update' : 'Add Transaction'}
        </button>
      </div>
    </form>
  )
}
