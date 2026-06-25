import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Budget from './pages/Budget'
import Layout from './components/Layout'

// Protected Route wrapper
function PrivateRoute({ children }) {
  const { token } = useSelector((state) => state.auth)
  return token ? children : <Navigate to="/login" replace />
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes wrapped in Layout */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="budget" element={<Budget />} />
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  )
}

export default App
