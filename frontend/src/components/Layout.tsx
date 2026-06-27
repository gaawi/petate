import { NavLink } from 'react-router-dom'
import { House, Shirt, DoorOpen, Luggage, Plane, Settings, LogOut } from 'lucide-react'
import { useAuth } from '../lib/auth'

const navItems = [
  { to: '/', label: 'Inicio', Icon: House, exact: true },
  { to: '/ropa', label: 'Ropa', Icon: Shirt },
  { to: '/armarios', label: 'Armarios', Icon: DoorOpen },
  { to: '/maletas', label: 'Maletas', Icon: Luggage },
  { to: '/viajes', label: 'Viajes', Icon: Plane },
  { to: '/ajustes', label: 'Ajustes', Icon: Settings },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const { signOut } = useAuth()

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar (escritorio) */}
      <aside className="hidden md:flex md:w-60 md:flex-col md:fixed md:inset-y-0 bg-white/80 backdrop-blur border-r border-black/5 z-40">
        <div className="px-6 py-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center">
              <Luggage className="w-5 h-5 text-white" strokeWidth={2.2} />
            </div>
            <div>
              <div className="font-bold text-gray-900 text-lg leading-tight tracking-tight">Petate</div>
              <div className="text-xs text-gray-400">Inventario de ropa</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 space-y-0.5">
          {navItems.map(({ to, label, Icon, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[15px] font-medium transition-colors ${
                  isActive ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-black/[0.03]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className="w-[22px] h-[22px]" strokeWidth={isActive ? 2.4 : 2} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="p-3">
          <button
            onClick={() => signOut()}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-[15px] font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-[22px] h-[22px]" strokeWidth={2} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Contenido */}
      <main className="flex-1 md:ml-60 pb-[calc(64px+var(--safe-bottom))] md:pb-0">
        {children}
      </main>

      {/* Tab bar (móvil) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 glass border-t border-black/5 pb-safe">
        <div className="flex">
          {navItems.map(({ to, label, Icon, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center gap-0.5 pt-2 pb-1.5 text-[10px] font-medium transition-colors ${
                  isActive ? 'text-brand-600' : 'text-gray-400'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className="w-[26px] h-[26px]" strokeWidth={isActive ? 2.4 : 1.9} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
