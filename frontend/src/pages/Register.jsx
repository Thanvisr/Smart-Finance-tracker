import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { registerUser, clearError } from '../redux/slices/authSlice'

export default function Register() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error, token } = useSelector((state) => state.auth)

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [localError, setLocalError] = useState('')

  useEffect(() => {
    if (token) navigate('/dashboard')
  }, [token, navigate])

  useEffect(() => {
    dispatch(clearError())
  }, [dispatch])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setLocalError('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) {
      setLocalError('Passwords do not match.')
      return
    }
    if (form.password.length < 6) {
      setLocalError('Password must be at least 6 characters.')
      return
    }
    dispatch(registerUser({ name: form.name, email: form.email, password: form.password }))
  }

  const displayError = localError || error

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl text-3xl mb-4 shadow-lg">
            💰
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Create account</h1>
          <p className="text-gray-500 mt-1">Start tracking your finances today</p>
        </div>

        {/* Card */}
        <div className="card shadow-md">
          {displayError && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg border border-red-200 mb-5">
              {displayError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="input-field"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Min. 6 characters"
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                type="password"
                name="confirm"
                value={form.confirm}
                onChange={handleChange}
                placeholder="Repeat password"
                className="input-field"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
