import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../redux/slices/authSlice'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/transactions', label: 'Transactions', icon: '💸' },
  { to: '/budget', label: 'Budget', icon: '🎯' },
]

export default function Layout() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full z-10">
        {/* Logo */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white text-lg">
              💰
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-900">FinanceTracker</h1>
              <p className="text-xs text-gray-500">Smart Budgeting</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User & Logout */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors duration-150"
          >
            <span>🚪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main content area — offset by sidebar width */}
      <main className="flex-1 ml-64 p-8 min-h-screen">
        <Outlet />
      </main>
    </div>
  )
}
