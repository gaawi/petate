import { useState, useEffect } from 'react'
import { Luggage, MapPin, SquarePen, Trash2, PlaneTakeoff, Plus } from 'lucide-react'
import { api } from '../api'
import type { Suitcase, Location, Garment, FamilyMember, Wardrobe } from '../types'
import Modal from '../components/Modal'
import GarmentCard from '../components/GarmentCard'
import GarmentForm from '../components/GarmentForm'

export default function Suitcases() {
  const [suitcases, setSuitcases] = useState<Suitcase[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [wardrobes, setWardrobes] = useState<Wardrobe[]>([])
  const [selected, setSelected] = useState<Suitcase | null>(null)
  const [garments, setGarments] = useState<Garment[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [editSuitcase, setEditSuitcase] = useState<Suitcase | null>(null)
  const [showMove, setShowMove] = useState(false)
  const [showAddGarment, setShowAddGarment] = useState(false)
  const [editingGarment, setEditingGarment] = useState<Garment | null>(null)
  const [form, setForm] = useState({ name: '', current_location_id: '' })
  const [moveTarget, setMoveTarget] = useState('')

  useEffect(() => {
    Promise.all([api.suitcases.list(), api.locations.list(), api.members.list(), api.wardrobes.list()])
      .then(([s, l, m, w]) => { setSuitcases(s); setLocations(l); setMembers(m); setWardrobes(w) })
  }, [])

  const loadGarments = (s: Suitcase) => {
    setSelected(s)
    api.garments.list({ suitcase_id: String(s.id) }).then(setGarments)
  }

  const handleSave = async () => {
    if (!form.name.trim()) return
    if (editSuitcase) {
      const updated = await api.suitcases.update(editSuitcase.id, { name: form.name, current_location_id: Number(form.current_location_id) || null })
      setSuitcases(prev => prev.map(s => s.id === updated.id ? updated : s))
      if (selected?.id === updated.id) setSelected(updated)
    } else {
      const created = await api.suitcases.create({ name: form.name, current_location_id: Number(form.current_location_id) || null })
      setSuitcases(prev => [...prev, created])
    }
    setShowAdd(false)
    setEditSuitcase(null)
    setForm({ name: '', current_location_id: '' })
  }

  const handleMove = async () => {
    if (!selected) return
    const updated = await api.suitcases.move(selected.id, Number(moveTarget) || null)
    setSuitcases(prev => prev.map(s => s.id === updated.id ? updated : s))
    setSelected(updated)
    setShowMove(false)
  }

  const handleDelete = async (s: Suitcase) => {
    if (!confirm(`¿Eliminar la maleta "${s.name}"? La ropa dentro quedará sin ubicar.`)) return
    await api.suitcases.delete(s.id)
    setSuitcases(prev => prev.filter(x => x.id !== s.id))
    if (selected?.id === s.id) { setSelected(null); setGarments([]) }
  }

  const handleSaveGarment = (g: Garment) => {
    setGarments(prev => {
      const idx = prev.findIndex(x => x.id === g.id)
      if (idx >= 0) return prev.map(x => x.id === g.id ? g : x)
      setSuitcases(ss => ss.map(s => s.id === g.suitcase_id ? { ...s, garment_count: (s.garment_count || 0) + 1 } : s))
      return [g, ...prev]
    })
    setShowAddGarment(false)
    setEditingGarment(null)
  }

  const handleDeleteGarment = async (g: Garment) => {
    if (!confirm(`¿Eliminar "${g.name}"?`)) return
    await api.garments.delete(g.id)
    setGarments(prev => prev.filter(x => x.id !== g.id))
    setSuitcases(ss => ss.map(s => s.id === g.suitcase_id ? { ...s, garment_count: Math.max(0, (s.garment_count || 0) - 1) } : s))
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="ios-large-title">Maletas</h1>
        <button
          onClick={() => { setForm({ name: '', current_location_id: '' }); setEditSuitcase(null); setShowAdd(true) }}
          className="ios-btn-primary"
        >
          <Plus className="w-4 h-4" />
          Nueva maleta
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Suitcase list */}
        <div className="md:col-span-1 space-y-2">
          {suitcases.map(s => (
            <div
              key={s.id}
              onClick={() => loadGarments(s)}
              className={`ios-card p-3 cursor-pointer ${
                selected?.id === s.id ? 'bg-brand-50 ring-1 ring-brand-200' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Luggage className="w-6 h-6 text-gray-400" />
                  <div>
                    <div className="font-medium text-sm text-gray-900">{s.name}</div>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      {s.location_name ? (
                        <><MapPin className="w-3 h-3" /> {s.location_name}</>
                      ) : 'Sin ubicar'} · {s.garment_count ?? 0} prendas
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={e => { e.stopPropagation(); setForm({ name: s.name, current_location_id: String(s.current_location_id || '') }); setEditSuitcase(s); setShowAdd(true) }}
                    className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-black/5"
                  ><SquarePen className="w-[18px]" /></button>
                  <button
                    onClick={e => { e.stopPropagation(); handleDelete(s) }}
                    className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-black/5"
                  ><Trash2 className="w-[18px]" /></button>
                </div>
              </div>
            </div>
          ))}
          {suitcases.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm">No hay maletas</div>
          )}
        </div>

        {/* Contents */}
        <div className="md:col-span-2">
          {selected ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="flex items-center gap-1.5 font-semibold text-gray-900"><Luggage className="w-5 h-5 text-gray-400" /> {selected.name}</h2>
                  <p className="flex items-center gap-1 text-sm text-gray-400">
                    {selected.location_name ? (
                      <><MapPin className="w-3.5 h-3.5" /> {selected.location_name}</>
                    ) : 'Sin ubicar'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setMoveTarget(String(selected.current_location_id || '')); setShowMove(true) }}
                    className="flex items-center gap-1.5 bg-amber-50 text-amber-700 rounded-xl px-3 py-1.5 font-medium"
                  >
                    <PlaneTakeoff className="w-4 h-4" />
                    Mover maleta
                  </button>
                  <button
                    onClick={() => setShowAddGarment(true)}
                    className="ios-btn-primary"
                  >
                    <Plus className="w-4 h-4" />
                    Añadir prenda
                  </button>
                </div>
              </div>
              {garments.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Luggage className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <div>Esta maleta está vacía</div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {garments.map(g => (
                    <GarmentCard
                      key={g.id}
                      garment={g}
                      onEdit={g => { setEditingGarment(g); setShowAddGarment(true) }}
                      onDelete={handleDeleteGarment}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
              Selecciona una maleta para ver su contenido
            </div>
          )}
        </div>
      </div>

      {/* Add/edit suitcase */}
      {showAdd && (
        <Modal title={editSuitcase ? 'Editar maleta' : 'Nueva maleta'} onClose={() => { setShowAdd(false); setEditSuitcase(null) }} size="sm">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Ej: Maleta grande azul"
                className="ios-field"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación actual</label>
              <select
                value={form.current_location_id}
                onChange={e => setForm(f => ({ ...f, current_location_id: e.target.value }))}
                className="ios-field"
              >
                <option value="">Sin ubicar</option>
                {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => { setShowAdd(false); setEditSuitcase(null) }} className="flex-1 py-2.5 rounded-xl bg-black/[0.06] text-gray-700 font-semibold">Cancelar</button>
              <button onClick={handleSave} className="ios-btn-primary flex-1 py-2.5">Guardar</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Move suitcase */}
      {showMove && selected && (
        <Modal title={`Mover "${selected.name}"`} onClose={() => setShowMove(false)} size="sm">
          <div className="space-y-4">
            <p className="text-sm text-gray-600">¿A dónde vas a llevar esta maleta?</p>
            <div className="space-y-2">
              <button
                onClick={() => setMoveTarget('')}
                className={`w-full flex items-center gap-2 p-3 rounded-xl border text-sm text-left transition-all ${!moveTarget ? 'border-brand-300 bg-brand-50 text-brand-700' : 'border-gray-100 hover:border-gray-200'}`}
              >
                <MapPin className="w-4 h-4" /> Sin ubicar (en tránsito)
              </button>
              {locations.map(l => (
                <button
                  key={l.id}
                  onClick={() => setMoveTarget(String(l.id))}
                  className={`w-full flex items-center gap-2 p-3 rounded-xl border text-sm text-left transition-all ${moveTarget === String(l.id) ? 'border-brand-300 bg-brand-50 text-brand-700' : 'border-gray-100 hover:border-gray-200'}`}
                >
                  <MapPin className="w-4 h-4" /> {l.name} — {l.city}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowMove(false)} className="flex-1 py-2.5 rounded-xl bg-black/[0.06] text-gray-700 font-semibold">Cancelar</button>
              <button onClick={handleMove} className="ios-btn-primary flex-1 py-2.5">Confirmar</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add garment */}
      {showAddGarment && selected && (
        <Modal title={editingGarment ? 'Editar prenda' : `Añadir a ${selected.name}`} onClose={() => { setShowAddGarment(false); setEditingGarment(null) }} size="xl">
          <GarmentForm
            garment={editingGarment ?? undefined}
            members={members}
            wardrobes={wardrobes}
            suitcases={suitcases}
            onSave={handleSaveGarment}
            onClose={() => { setShowAddGarment(false); setEditingGarment(null) }}
          />
        </Modal>
      )}
    </div>
  )
}
