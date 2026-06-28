import { useState, useEffect } from 'react'
import { Check, Search, Minus, Plus } from 'lucide-react'
import { api } from '../api'
import type { Garment, FamilyMember } from '../types'
import { getCategoryInfo } from '../types'
import { CategoryIcon } from './icons'
import Modal from './Modal'

export interface PickSelection {
  garment: Garment
  qty: number
}

interface Props {
  title: string
  members: FamilyMember[]
  /** Prendas que ya están dentro (se marcan y no se pueden re-seleccionar) */
  alreadyInIds?: number[]
  onConfirm: (selections: PickSelection[]) => void | Promise<void>
  onClose: () => void
}

export default function GarmentPicker({ title, members, alreadyInIds = [], onConfirm, onClose }: Props) {
  const [garments, setGarments] = useState<Garment[]>([])
  const [loading, setLoading] = useState(true)
  // id -> cantidad a mover
  const [selected, setSelected] = useState<Record<number, number>>({})
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

  const toggle = (g: Garment) => {
    if (already.has(g.id)) return
    setSelected(prev => {
      const next = { ...prev }
      if (g.id in next) delete next[g.id]
      else next[g.id] = g.quantity ?? 1   // por defecto se mueve todo
      return next
    })
  }

  const setQty = (g: Garment, qty: number) => {
    const max = g.quantity ?? 1
    setSelected(prev => ({ ...prev, [g.id]: Math.max(1, Math.min(max, qty)) }))
  }

  const selectedGarments = garments.filter(g => g.id in selected)
  const multiUnit = selectedGarments.filter(g => (g.quantity ?? 1) > 1)
  const count = selectedGarments.length

  const confirm = async () => {
    setSaving(true)
    await onConfirm(selectedGarments.map(g => ({ garment: g, qty: selected[g.id] })))
  }

  return (
    <Modal title={title} onClose={onClose} size="lg">
      {/* Buscador + filtro por persona */}
      <div className="space-y-2 mb-3 sticky top-0 bg-white pt-1 pb-2 z-10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar prenda..." className="ios-field pl-9" />
        </div>
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          <button onClick={() => setOwnerFilter('')} className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium ${!ownerFilter ? 'bg-gray-900 text-white' : 'bg-black/[0.06] text-gray-600'}`}>Todos</button>
          {members.map(m => (
            <button key={m.id} onClick={() => setOwnerFilter(ownerFilter === String(m.id) ? '' : String(m.id))}
              className="flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: ownerFilter === String(m.id) ? m.color : '#d1d5db' }}>{m.name}</button>
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
            const isSel = g.id in selected
            return (
              <button key={g.id} onClick={() => toggle(g)} disabled={isIn}
                className={`relative text-left rounded-xl overflow-hidden border-2 transition-all ${isSel ? 'border-brand-500' : 'border-transparent'} ${isIn ? 'opacity-40' : ''}`}>
                <div className="aspect-square bg-gray-100 flex items-center justify-center">
                  {g.photo_path ? <img src={g.photo_path} alt={g.name} className="w-full h-full object-cover" /> : <CategoryIcon value={g.category} className="w-8 h-8 text-gray-300" />}
                </div>
                {(isSel || isIn) && (
                  <div className={`absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center ${isIn ? 'bg-gray-500' : 'bg-brand-600'}`}>
                    <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                  </div>
                )}
                {(g.quantity ?? 1) > 1 && (
                  <div className="absolute top-1 left-1 px-1.5 h-5 flex items-center rounded-full bg-black/55 text-white text-[10px] font-bold">×{g.quantity}</div>
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

      {/* Reparto de cantidades para prendas con varias unidades */}
      {multiUnit.length > 0 && (
        <div className="mt-4 ios-group divide-y divide-black/5">
          <div className="px-4 pt-2.5 pb-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">¿Cuántas mover?</div>
          {multiUnit.map(g => (
            <div key={g.id} className="flex items-center justify-between px-4 py-2.5">
              <div className="min-w-0 mr-3">
                <div className="text-sm font-medium text-gray-900 truncate">{g.name}</div>
                <div className="text-xs text-gray-400">Tienes {g.quantity}</div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => setQty(g, selected[g.id] - 1)} className="w-8 h-8 flex items-center justify-center rounded-full bg-black/[0.06] text-gray-700 disabled:opacity-40" disabled={selected[g.id] <= 1}><Minus className="w-4 h-4" strokeWidth={2.5} /></button>
                <span className="w-7 text-center font-semibold">{selected[g.id]}</span>
                <button onClick={() => setQty(g, selected[g.id] + 1)} className="w-8 h-8 flex items-center justify-center rounded-full bg-black/[0.06] text-gray-700 disabled:opacity-40" disabled={selected[g.id] >= (g.quantity ?? 1)}><Plus className="w-4 h-4" strokeWidth={2.5} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="sticky bottom-0 bg-white pt-3 mt-2 flex gap-3">
        <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-black/[0.06] text-gray-700 font-semibold">Cancelar</button>
        <button onClick={confirm} disabled={count === 0 || saving} className="ios-btn-primary flex-1 py-2.5 disabled:opacity-50">
          {saving ? 'Moviendo...' : `Mover ${count || ''}`.trim()}
        </button>
      </div>
    </Modal>
  )
}
