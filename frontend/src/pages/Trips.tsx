import { useState, useEffect } from 'react'
import { api } from '../api'
import type { Trip, Suitcase } from '../types'
import Modal from '../components/Modal'

export default function Trips() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [suitcases, setSuitcases] = useState<Suitcase[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<Trip | null>(null)
  const [form, setForm] = useState({ name: '', destination: '', start_date: '', end_date: '', notes: '' })

  useEffect(() => {
    Promise.all([api.trips.list(), api.suitcases.list()]).then(([t, s]) => { setTrips(t); setSuitcases(s) })
  }, [])

  const openAdd = () => { setEditing(null); setForm({ name: '', destination: '', start_date: '', end_date: '', notes: '' }); setShowAdd(true) }
  const openEdit = (t: Trip) => { setEditing(t); setForm({ name: t.name, destination: t.destination || '', start_date: t.start_date || '', end_date: t.end_date || '', notes: t.notes || '' }); setShowAdd(true) }

  const handleSave = async () => {
    if (!form.name.trim()) return
    if (editing) {
      const updated = await api.trips.update(editing.id, form)
      setTrips(prev => prev.map(t => t.id === updated.id ? { ...updated, suitcases: t.suitcases } : t))
    } else {
      const created = await api.trips.create(form)
      setTrips(prev => [created, ...prev])
    }
    setShowAdd(false)
    setEditing(null)
  }

  const handleDelete = async (t: Trip) => {
    if (!confirm(`¿Eliminar el viaje "${t.name}"?`)) return
    await api.trips.delete(t.id)
    setTrips(prev => prev.filter(x => x.id !== t.id))
  }

  const toggleSuitcase = async (trip: Trip, suitcaseId: number) => {
    const isLinked = trip.suitcases.some(s => s.id === suitcaseId)
    const updated = isLinked
      ? await api.trips.removeSuitcase(trip.id, suitcaseId)
      : await api.trips.addSuitcase(trip.id, suitcaseId)
    setTrips(prev => prev.map(t => t.id === trip.id ? updated : t))
  }

  const getTripStatus = (trip: Trip) => {
    if (!trip.start_date) return { label: 'Planificado', color: 'bg-gray-100 text-gray-600' }
    const now = new Date()
    const start = new Date(trip.start_date)
    const end = trip.end_date ? new Date(trip.end_date) : null
    if (end && now > end) return { label: 'Completado', color: 'bg-emerald-100 text-emerald-700' }
    if (now >= start && (!end || now <= end)) return { label: 'En curso', color: 'bg-amber-100 text-amber-700' }
    return { label: 'Próximo', color: 'bg-blue-100 text-blue-700' }
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Viajes</h1>
        <button
          onClick={openAdd}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          + Nuevo viaje
        </button>
      </div>

      {trips.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">✈️</div>
          <div className="font-medium">No hay viajes planificados</div>
          <button onClick={openAdd} className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm hover:bg-indigo-700">
            Planificar un viaje
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {trips.map(trip => {
            const status = getTripStatus(trip)
            return (
              <div key={trip.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900">{trip.name}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                      {trip.destination && (
                        <div className="text-sm text-gray-500 mt-0.5">📍 {trip.destination}</div>
                      )}
                      {(trip.start_date || trip.end_date) && (
                        <div className="text-sm text-gray-400 mt-0.5">
                          📅 {trip.start_date || '?'} {trip.end_date ? `→ ${trip.end_date}` : ''}
                        </div>
                      )}
                      {trip.notes && (
                        <div className="text-sm text-gray-400 mt-1 italic">{trip.notes}</div>
                      )}
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => openEdit(trip)} className="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors">✏️</button>
                      <button onClick={() => handleDelete(trip)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors">🗑️</button>
                    </div>
                  </div>

                  {/* Suitcases */}
                  <div className="mt-3 pt-3 border-t border-gray-50">
                    <div className="text-xs font-medium text-gray-500 mb-2">Maletas para este viaje:</div>
                    <div className="flex flex-wrap gap-2">
                      {suitcases.map(s => {
                        const linked = trip.suitcases.some(ts => ts.id === s.id)
                        return (
                          <button
                            key={s.id}
                            onClick={() => toggleSuitcase(trip, s.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                              linked
                                ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                                : 'border-gray-200 text-gray-500 hover:border-gray-300'
                            }`}
                          >
                            🧳 {s.name}
                            {linked && <span className="text-indigo-400">✓</span>}
                          </button>
                        )
                      })}
                      {suitcases.length === 0 && (
                        <span className="text-xs text-gray-400">No hay maletas creadas</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Linked suitcase contents preview */}
                {trip.suitcases.length > 0 && (
                  <div className="bg-gray-50 px-4 py-2 border-t border-gray-100">
                    <div className="text-xs text-gray-400">
                      {trip.suitcases.map(s => (
                        <span key={s.id} className="mr-3">
                          🧳 {s.name} {s.garment_count ? `(${s.garment_count} prendas)` : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Add/edit modal */}
      {showAdd && (
        <Modal title={editing ? 'Editar viaje' : 'Nuevo viaje'} onClose={() => { setShowAdd(false); setEditing(null) }} size="sm">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del viaje *</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Ej: Verano en España"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Destino</label>
              <input
                type="text"
                value={form.destination}
                onChange={e => setForm(f => ({ ...f, destination: e.target.value }))}
                placeholder="Ej: Madrid, España"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha inicio</label>
                <input
                  type="date"
                  value={form.start_date}
                  onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha fin</label>
                <input
                  type="date"
                  value={form.end_date}
                  onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
              <textarea
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                rows={2}
                placeholder="Notas sobre el viaje..."
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => { setShowAdd(false); setEditing(null) }} className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-700">Cancelar</button>
              <button onClick={handleSave} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm">Guardar</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
