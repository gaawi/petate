import { useState, useEffect } from 'react'
import { api } from '../api'
import type { FamilyMember, Location } from '../types'
import Modal from '../components/Modal'

const COLORS = ['#3b82f6', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#84cc16']
const ROLES = [
  { value: 'padre', label: '👨 Padre' },
  { value: 'madre', label: '👩 Madre' },
  { value: 'hijo', label: '🧒 Hijo/a' },
  { value: 'otro', label: '👤 Otro' },
]

export default function Settings() {
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [showMember, setShowMember] = useState(false)
  const [showLocation, setShowLocation] = useState(false)
  const [editMember, setEditMember] = useState<FamilyMember | null>(null)
  const [editLocation, setEditLocation] = useState<Location | null>(null)
  const [mForm, setMForm] = useState({ name: '', role: 'hijo', color: '#10b981' })
  const [lForm, setLForm] = useState({ name: '', city: '', country: '' })

  useEffect(() => {
    Promise.all([api.members.list(), api.locations.list()]).then(([m, l]) => { setMembers(m); setLocations(l) })
  }, [])

  const openAddMember = () => { setEditMember(null); setMForm({ name: '', role: 'hijo', color: '#10b981' }); setShowMember(true) }
  const openEditMember = (m: FamilyMember) => { setEditMember(m); setMForm({ name: m.name, role: m.role, color: m.color }); setShowMember(true) }

  const saveMember = async () => {
    if (!mForm.name.trim()) return
    if (editMember) {
      const updated = await api.members.update(editMember.id, mForm)
      setMembers(prev => prev.map(m => m.id === updated.id ? updated : m))
    } else {
      const created = await api.members.create(mForm)
      setMembers(prev => [...prev, created])
    }
    setShowMember(false)
  }

  const deleteMember = async (m: FamilyMember) => {
    if (!confirm(`¿Eliminar a "${m.name}"? Sus prendas quedarán sin dueño.`)) return
    await api.members.delete(m.id)
    setMembers(prev => prev.filter(x => x.id !== m.id))
  }

  const openAddLocation = () => { setEditLocation(null); setLForm({ name: '', city: '', country: '' }); setShowLocation(true) }
  const openEditLocation = (l: Location) => { setEditLocation(l); setLForm({ name: l.name, city: l.city, country: l.country }); setShowLocation(true) }

  const saveLocation = async () => {
    if (!lForm.name.trim() || !lForm.city.trim()) return
    if (editLocation) {
      const updated = await api.locations.update(editLocation.id, lForm)
      setLocations(prev => prev.map(l => l.id === updated.id ? updated : l))
    } else {
      const created = await api.locations.create(lForm)
      setLocations(prev => [...prev, created])
    }
    setShowLocation(false)
  }

  const deleteLocation = async (l: Location) => {
    if (!confirm(`¿Eliminar la ubicación "${l.name}"?`)) return
    await api.locations.delete(l.id)
    setLocations(prev => prev.filter(x => x.id !== l.id))
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl space-y-8">
      <h1 className="text-xl font-bold text-gray-900">Ajustes</h1>

      {/* Family members */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-800">👨‍👩‍👧‍👦 Familia</h2>
          <button
            onClick={openAddMember}
            className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-medium hover:bg-indigo-100 transition-colors"
          >
            + Añadir persona
          </button>
        </div>
        <div className="space-y-2">
          {members.map(m => (
            <div key={m.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                style={{ backgroundColor: m.color }}
              >
                {m.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900">{m.name}</div>
                <div className="text-xs text-gray-400 capitalize">{ROLES.find(r => r.value === m.role)?.label || m.role} · {m.garment_count ?? 0} prendas</div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEditMember(m)} className="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors">✏️</button>
                <button onClick={() => deleteMember(m)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors">🗑️</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Locations */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-800">📍 Ubicaciones</h2>
          <button
            onClick={openAddLocation}
            className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-medium hover:bg-indigo-100 transition-colors"
          >
            + Añadir ubicación
          </button>
        </div>
        <div className="space-y-2">
          {locations.map(l => (
            <div key={l.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className="text-2xl">🏠</div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900">{l.name}</div>
                <div className="text-xs text-gray-400">{l.city}, {l.country}</div>
                <div className="text-xs text-gray-400">
                  {l.wardrobe_count ?? 0} armarios · {l.suitcase_count ?? 0} maletas
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEditLocation(l)} className="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors">✏️</button>
                <button onClick={() => deleteLocation(l)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors">🗑️</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Member modal */}
      {showMember && (
        <Modal title={editMember ? 'Editar persona' : 'Nueva persona'} onClose={() => setShowMember(false)} size="sm">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input
                type="text"
                value={mForm.name}
                onChange={e => setMForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Ej: María"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
              <div className="flex flex-wrap gap-2">
                {ROLES.map(r => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setMForm(f => ({ ...f, role: r.value }))}
                    className={`px-3 py-1.5 rounded-xl border text-sm transition-all ${
                      mForm.role === r.value ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-medium' : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setMForm(f => ({ ...f, color: c }))}
                    className="w-8 h-8 rounded-full border-2 transition-all"
                    style={{ backgroundColor: c, borderColor: mForm.color === c ? '#000' : 'transparent' }}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowMember(false)} className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-700">Cancelar</button>
              <button onClick={saveMember} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm">Guardar</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Location modal */}
      {showLocation && (
        <Modal title={editLocation ? 'Editar ubicación' : 'Nueva ubicación'} onClose={() => setShowLocation(false)} size="sm">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input
                type="text"
                value={lForm.name}
                onChange={e => setLForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Ej: Casa Nueva York"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
              <input
                type="text"
                value={lForm.city}
                onChange={e => setLForm(f => ({ ...f, city: e.target.value }))}
                placeholder="Ej: Nueva York"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">País</label>
              <input
                type="text"
                value={lForm.country}
                onChange={e => setLForm(f => ({ ...f, country: e.target.value }))}
                placeholder="Ej: Estados Unidos"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowLocation(false)} className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-700">Cancelar</button>
              <button onClick={saveLocation} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm">Guardar</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
