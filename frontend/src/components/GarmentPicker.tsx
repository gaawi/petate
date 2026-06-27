import { useState, useEffect } from 'react'
import { Check, Search } from 'lucide-react'
import { api } from '../api'
import type { Garment, FamilyMember } from '../types'
import { getCategoryInfo } from '../types'
import { CategoryIcon } from './icons'
import Modal from './Modal'

interface Props {
  title: string
  members: FamilyMember[]
  /** Prendas que ya están dentro (se marcan como "ya añadida" y no se pueden re-seleccionar) */
  alreadyInIds?: number[]
  onConfirm: (ids: number[]) => void
  onClose: () => void
}

export default function GarmentPicker({ title, members, alreadyInIds = [], onConfirm, onClose }: Props) {
  const [garments, setGarments] = useState<Garment[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [search, setSearch] = useState('')
  const [ownerFilter, setOwnerFilter] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.garments.list().then(g => { setGarments(g); setLoading(false) })
  }, [])

  const already = new Set(alreadyInIds)
  const filtered = garments.filter(g => {
    if (ownerFilter && String(g.owner_id) !== ownerFilter) return false
    if (search) {
      const s = search.toLowerCase()
      if (!g.name.toLowerCase().includes(s) && !(g.brand || '').toLowerCase().includes(s)) return false
    }
    return true
  })

  const toggle = (id: number) => {
    if (already.has(id)) return
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const confirm = async () => {
    setSaving(true)
    await onConfirm([...selected])
  }

  return (
    <Modal title={title} onClose={onClose} size="lg">
      {/* Buscador + filtro por persona */}
      <div className="space-y-2 mb-3 sticky top-0 bg-white pt-1 pb-2 z-10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar prenda..."
            className="ios-field pl-9"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setOwnerFilter('')}
            className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium ${!ownerFilter ? 'bg-gray-900 text-white' : 'bg-black/[0.06] text-gray-600'}`}
          >Todos</button>
          {members.map(m => (
            <button
              key={m.id}
              onClick={() => setOwnerFilter(ownerFilter === String(m.id) ? '' : String(m.id))}
              className="flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: ownerFilter === String(m.id) ? m.color : '#d1d5db' }}
            >{m.name}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-400">Cargando...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10 text-gray-400 text-sm">No hay prendas</div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {filtered.map(g => {
            const cat = getCategoryInfo(g.category)
            const isIn = already.has(g.id)
            const isSel = selected.has(g.id)
            return (
              <button
                key={g.id}
                onClick={() => toggle(g.id)}
                disabled={isIn}
                className={`relative text-left rounded-xl overflow-hidden border-2 transition-all ${
                  isSel ? 'border-brand-500' : 'border-transparent'
                } ${isIn ? 'opacity-40' : ''}`}
              >
                <div className="aspect-square bg-gray-100 flex items-center justify-center">
                  {g.photo_path
                    ? <img src={g.photo_path} alt={g.name} className="w-full h-full object-cover" />
                    : <CategoryIcon value={g.category} className="w-8 h-8 text-gray-300" />}
                </div>
                {(isSel || isIn) && (
                  <div className={`absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center ${isIn ? 'bg-gray-500' : 'bg-brand-600'}`}>
                    <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                  </div>
                )}
                {g.owner_color && (
                  <div className="absolute top-1 left-1 w-2.5 h-2.5 rounded-full ring-2 ring-white" style={{ backgroundColor: g.owner_color }} />
                )}
                <div className="px-1.5 py-1">
                  <div className="text-[11px] font-medium text-gray-800 truncate">{g.name}</div>
                  <div className="text-[10px] text-gray-400 truncate">{cat.label}</div>
                </div>
              </button>
            )
          })}
        </div>
      )}

      <div className="sticky bottom-0 bg-white pt-3 mt-2 flex gap-3">
        <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-black/[0.06] text-gray-700 font-semibold">
          Cancelar
        </button>
        <button
          onClick={confirm}
          disabled={selected.size === 0 || saving}
          className="ios-btn-primary flex-1 py-2.5 disabled:opacity-50"
        >
          {saving ? 'Añadiendo...' : `Añadir ${selected.size || ''}`.trim()}
        </button>
      </div>
    </Modal>
  )
}
