import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import type { Wardrobe, Location, Garment, FamilyMember, Suitcase } from '../types'
import Modal from '../components/Modal'
import GarmentCard from '../components/GarmentCard'
import GarmentForm from '../components/GarmentForm'

export default function Wardrobes() {
  const [wardrobes, setWardrobes] = useState<Wardrobe[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [suitcases, setSuitcases] = useState<Suitcase[]>([])
  const [selected, setSelected] = useState<Wardrobe | null>(null)
  const [garments, setGarments] = useState<Garment[]>([])
  const [showAddWardrobe, setShowAddWardrobe] = useState(false)
  const [editWardrobe, setEditWardrobe] = useState<Wardrobe | null>(null)
  const [showAddGarment, setShowAddGarment] = useState(false)
  const [editingGarment, setEditingGarment] = useState<Garment | null>(null)
  const [form, setForm] = useState({ name: '', location_id: '' })

  useEffect(() => {
    Promise.all([api.wardrobes.list(), api.locations.list(), api.members.list(), api.suitcases.list()])
      .then(([w, l, m, s]) => { setWardrobes(w); setLocations(l); setMembers(m); setSuitcases(s) })
  }, [])

  const loadGarments = (w: Wardrobe) => {
    setSelected(w)
    api.garments.list({ wardrobe_id: String(w.id) }).then(setGarments)
  }

  const handleSaveWardrobe = async () => {
    if (!form.name.trim()) return
    if (editWardrobe) {
      const updated = await api.wardrobes.update(editWardrobe.id, { name: form.name, location_id: Number(form.location_id) || null })
      setWardrobes(prev => prev.map(w => w.id === updated.id ? updated : w))
      if (selected?.id === updated.id) setSelected(updated)
    } else {
      const created = await api.wardrobes.create({ name: form.name, location_id: Number(form.location_id) || null })
      setWardrobes(prev => [...prev, created])
    }
    setShowAddWardrobe(false)
    setEditWardrobe(null)
    setForm({ name: '', location_id: '' })
  }

  const handleDeleteWardrobe = async (w: Wardrobe) => {
    if (!confirm(`¿Eliminar el armario "${w.name}"? La ropa dentro quedará sin ubicar.`)) return
    await api.wardrobes.delete(w.id)
    setWardrobes(prev => prev.filter(x => x.id !== w.id))
    if (selected?.id === w.id) { setSelected(null); setGarments([]) }
  }

  const handleSaveGarment = (g: Garment) => {
    setGarments(prev => {
      const idx = prev.findIndex(x => x.id === g.id)
      if (idx >= 0) return prev.map(x => x.id === g.id ? g : x)
      // refresh wardrobe count
      setWardrobes(ws => ws.map(w => w.id === g.wardrobe_id ? { ...w, garment_count: (w.garment_count || 0) + 1 } : w))
      return [g, ...prev]
    })
    setShowAddGarment(false)
    setEditingGarment(null)
  }

  const handleDeleteGarment = async (g: Garment) => {
    if (!confirm(`¿Eliminar "${g.name}"?`)) return
    await api.garments.delete(g.id)
    setGarments(prev => prev.filter(x => x.id !== g.id))
    setWardrobes(ws => ws.map(w => w.id === g.wardrobe_id ? { ...w, garment_count: Math.max(0, (w.garment_count || 0) - 1) } : w))
  }

  // Group by location
  const byLocation: Record<string, Wardrobe[]> = {}
  wardrobes.forEach(w => {
    const key = w.location_name || 'Sin ubicación'
    if (!byLocation[key]) byLocation[key] = []
    byLocation[key].push(w)
  })

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Armarios</h1>
        <button
          onClick={() => { setForm({ name: '', location_id: '' }); setEditWardrobe(null); setShowAddWardrobe(true) }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          + Nuevo armario
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Wardrobe list */}
        <div className="md:col-span-1 space-y-4">
          {Object.entries(byLocation).map(([locName, wds]) => (
            <div key={locName}>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
                📍 {locName}
              </div>
              <div className="space-y-2">
                {wds.map(w => (
                  <div
                    key={w.id}
                    onClick={() => loadGarments(w)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      selected?.id === w.id
                        ? 'border-indigo-300 bg-indigo-50'
                        : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🚪</span>
                        <div>
                          <div className="font-medium text-sm text-gray-900">{w.name}</div>
                          <div className="text-xs text-gray-400">{w.garment_count ?? 0} prendas</div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={e => { e.stopPropagation(); setForm({ name: w.name, location_id: String(w.location_id || '') }); setEditWardrobe(w); setShowAddWardrobe(true) }}
                          className="p-1 text-gray-400 hover:text-indigo-600 transition-colors"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); handleDeleteWardrobe(w) }}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {wardrobes.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm">No hay armarios</div>
          )}
        </div>

        {/* Garment grid */}
        <div className="md:col-span-2">
          {selected ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-semibold text-gray-900">🚪 {selected.name}</h2>
                  {selected.location_name && (
                    <p className="text-sm text-gray-400">📍 {selected.location_name}</p>
                  )}
                </div>
                <button
                  onClick={() => setShowAddGarment(true)}
                  className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-medium hover:bg-indigo-100 transition-colors"
                >
                  + Añadir prenda aquí
                </button>
              </div>
              {garments.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <div className="text-4xl mb-2">🚪</div>
                  <div>Este armario está vacío</div>
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
              Selecciona un armario para ver su contenido
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit wardrobe modal */}
      {showAddWardrobe && (
        <Modal title={editWardrobe ? 'Editar armario' : 'Nuevo armario'} onClose={() => { setShowAddWardrobe(false); setEditWardrobe(null) }} size="sm">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Ej: Armario principal"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
              <select
                value={form.location_id}
                onChange={e => setForm(f => ({ ...f, location_id: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                <option value="">Sin ubicación</option>
                {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => { setShowAddWardrobe(false); setEditWardrobe(null) }} className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50">Cancelar</button>
              <button onClick={handleSaveWardrobe} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm hover:bg-indigo-700">Guardar</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add garment to wardrobe */}
      {showAddGarment && selected && (
        <Modal title={editingGarment ? 'Editar prenda' : `Añadir a ${selected.name}`} onClose={() => { setShowAddGarment(false); setEditingGarment(null) }} size="xl">
          <GarmentForm
            garment={editingGarment ? editingGarment : undefined}
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
