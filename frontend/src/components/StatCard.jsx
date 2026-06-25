export default function StatCard({ title, value, icon, color = 'blue', subtitle }) {
  const colorMap = {
    blue:   { bg: 'bg-blue-50',   icon: 'bg-blue-100',   text: 'text-blue-600',   val: 'text-blue-700' },
    green:  { bg: 'bg-green-50',  icon: 'bg-green-100',  text: 'text-green-600',  val: 'text-green-700' },
    red:    { bg: 'bg-red-50',    icon: 'bg-red-100',    text: 'text-red-600',    val: 'text-red-700' },
    purple: { bg: 'bg-purple-50', icon: 'bg-purple-100', text: 'text-purple-600', val: 'text-purple-700' },
    yellow: { bg: 'bg-yellow-50', icon: 'bg-yellow-100', text: 'text-yellow-600', val: 'text-yellow-700' },
  }
  const c = colorMap[color] || colorMap.blue

  return (
    <div className={`card flex items-center gap-4`}>
      <div className={`${c.icon} w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</p>
        <p className={`text-2xl font-bold mt-0.5 ${c.val} truncate`}>{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  )
}
