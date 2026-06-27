import { NavLink, useLocation } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Inicio', emoji: '🏠', exact: true },
  { to: '/ropa', label: 'Ropa', emoji: '👕' },
  { to: '/armarios', label: 'Armarios', emoji: '🚪' },
  { to: '/maletas', label: 'Maletas', emoji: '🧳' },
  { to: '/viajes', label: 'Viajes', emoji: '✈️' },
  { to: '/ajustes', label: 'Ajustes', emoji: '⚙️' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex md:w-56 md:flex-col md:fixed md:inset-y-0 bg-white border-r border-gray-100 shadow-sm z-40">
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🧳</span>
            <div>
              <div className="font-bold text-gray-900 text-lg leading-tight">Petate</div>
              <div className="text-xs text-gray-400">Inventario de ropa</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 py-4 space-y-1 px-3">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <span className="text-lg">{item.emoji}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 md:ml-56 pb-20 md:pb-0">
        {children}
      </main>

      {/* Bottom nav mobile */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 z-40 flex">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-2 text-xs font-medium transition-colors ${
                isActive ? 'text-indigo-600' : 'text-gray-400'
              }`
            }
          >
            <span className="text-xl mb-0.5">{item.emoji}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
