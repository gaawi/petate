import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Trash2, ArrowUp, ArrowDown } from 'lucide-react'
import { api } from '../api'
import { getCategoryInfo } from '../types'
import { CategoryIcon, SeasonIcon, UseTypeIcon } from '../components/icons'

export default function Dashboard() {
  const [stats, setStats] = useState<{
    total: number
    byOwner: Array<{ id: number; name: string; color: string; count: number }>
    byCategory: Array<{ category: string; count: number }>
    byUseType: Array<{ use_type: string; count: number }>
    bySeason: Array<{ season: string; count: number }>
  } | null>(null)

  useEffect(() => {
    api.garments.stats().then(setStats).catch(console.error)
  }, [])

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Cargando...</div>
      </div>
    )
  }

  const seasonLabels: Record<string, string> = {
    todo: 'Todo el año', verano: 'Verano', invierno: 'Invierno',
    primavera: 'Primavera', otono: 'Otoño',
  }
  const useTypeLabels: Record<string, string> = {
    salir: 'Salir', casa: 'Casa', trabajo: 'Trabajo',
    deporte: 'Deporte', ensuciar: 'Ensuciar', playa: 'Playa',
    pijama: 'Pijama', donar: 'Donar', tirar: 'Tirar',
  }

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="ios-large-title text-gray-900">¡Hola!</h1>
        <p className="text-gray-500 mt-1">Tienes <strong>{stats.total}</strong> prendas en tu inventario</p>
      </div>

      {/* Por persona */}
      <section className="mb-8">
        <h2 className="text-base font-semibold text-gray-700 mb-3">Por persona</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.byOwner.map(m => (
            <Link
              key={m.id}
              to={`/ropa?owner_id=${m.id}`}
              className="ios-card p-4 hover:shadow-md transition-shadow text-center"
            >
              <div
                className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-white text-xl font-bold"
                style={{ backgroundColor: m.color }}
              >
                {m.name.charAt(0)}
              </div>
              <div className="font-semibold text-gray-900">{m.name}</div>
              <div className="text-2xl font-bold mt-1" style={{ color: m.color }}>{m.count}</div>
              <div className="text-xs text-gray-400">prendas</div>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Por tipo */}
        <section className="ios-card rounded-2xl p-5">
          <h2 className="text-base font-semibold text-gray-700 mb-4">Por tipo de prenda</h2>
          <div className="space-y-2">
            {stats.byCategory.slice(0, 8).map(item => {
              const cat = getCategoryInfo(item.category)
              const pct = stats.total > 0 ? Math.round((item.count / stats.total) * 100) : 0
              return (
                <Link key={item.category} to={`/ropa?category=${item.category}`} className="flex items-center gap-3 group">
                  <CategoryIcon value={item.category} className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex justify-between text-xs text-gray-600 mb-0.5">
                      <span className="group-hover:text-brand-600 transition-colors">{cat.label}</span>
                      <span className="font-medium">{item.count}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-400 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        <div className="space-y-6">
          {/* Por uso */}
          <section className="ios-card rounded-2xl p-5">
            <h2 className="text-base font-semibold text-gray-700 mb-3">Por uso</h2>
            <div className="flex flex-wrap gap-2">
              {stats.byUseType.map(item => (
                <Link
                  key={item.use_type}
                  to={`/ropa?use_type=${item.use_type}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-black/[0.05] hover:bg-brand-50 rounded-xl text-sm text-gray-700 transition-colors"
                >
                  <UseTypeIcon value={item.use_type} className="w-4 h-4 text-gray-500" />
                  {useTypeLabels[item.use_type] || item.use_type}
                  <span className="font-bold text-gray-900">{item.count}</span>
                </Link>
              ))}
            </div>
          </section>

          {/* Por temporada */}
          <section className="ios-card rounded-2xl p-5">
            <h2 className="text-base font-semibold text-gray-700 mb-3">Por temporada</h2>
            <div className="flex flex-wrap gap-2">
              {stats.bySeason.map(item => (
                <Link
                  key={item.season}
                  to={`/ropa?season=${item.season}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-black/[0.05] hover:bg-brand-50 rounded-xl text-sm text-gray-700 transition-colors"
                >
                  <SeasonIcon value={item.season} className="w-4 h-4 text-gray-500" />
                  {seasonLabels[item.season] || item.season}
                  <span className="font-bold text-gray-900">{item.count}</span>
                </Link>
              ))}
            </div>
          </section>

          {/* Quick links */}
          <section className="ios-card rounded-2xl p-5">
            <h2 className="text-base font-semibold text-gray-700 mb-3">Accesos rápidos</h2>
            <div className="grid grid-cols-2 gap-2">
              {[
                { to: '/ropa?use_type=donar', label: 'Para donar', Icon: Heart },
                { to: '/ropa?use_type=tirar', label: 'Para tirar', Icon: Trash2 },
                { to: '/ropa?fit=grande', label: 'Queda grande', Icon: ArrowUp },
                { to: '/ropa?fit=pequena', label: 'Queda pequeña', Icon: ArrowDown },
              ].map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-black/[0.05] hover:bg-brand-50 rounded-xl text-xs text-gray-700 transition-colors"
                >
                  <link.Icon className="w-4 h-4 text-gray-500" /> {link.label}
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
