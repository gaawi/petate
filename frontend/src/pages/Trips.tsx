import { useState, useEffect } from 'react'
import { api } from '../api'
import type { Trip, Suitcase, Location } from '../types'
import Modal from '../components/Modal'
import { MapPin, Calendar, Luggage, SquarePen, Trash2, Plane, Plus, Check, PlaneLanding, Shirt } from 'lucide-react'

export default function Trips({ embedded = false }: { embedded?: boolean }) {
  const [trips, setTrips] = useState<Trip[]>([])
  const [suitcases, setSuitcases] = useState<Suitcase[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<Trip | null>(null)
  const [form, setForm] = useState({ name: '', destination: '', start_date: '', end_date: '', notes: '' })
  const [arrivingTrip, setArrivingTrip] = useState<Trip | null>(null)
  const [arriveTarget, setArriveTarget] = useState('')

  useEffect(() => {
    Promise.all([api.trips.list(), api.suitcases.list(), api.locations.list()])
      .then(([t, s, l]) => { setTrips(t); setSuitcases(s); setLocations(l) })
  }, [])

  // Marcar llegada: mueve TODAS las maletas del viaje a la casa de destino.
  const handleArrive = async () => {
    if (!arrivingTrip) return
    const target = Number(arriveTarget) || null
    await Promise.all(arrivingTrip.suitcases.map(s => api.suitcases.move(s.id, target)))
    const [s, refreshedTrips] = await Promise.all([api.suitcases.list(), api.trips.list()])
    setSuitcases(s)
    setTrips(refreshedTrips)
    setArrivingTrip(null)
  }

  const tripGarmentCount = (trip: Trip) => trip.suitcases.reduce((sum, s) => sum + (s.garment_count ?? 0), 0)

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
    <div className={embedded ? 'max-w-3xl' : 'p-4 md:p-6 max-w-3xl'}>
      <div className="flex items-center justify-between gap-3 mb-6">
        {embedded
          ? <p className="text-sm text-gray-400 min-w-0">Planifica y haz las maletas para cada viaje</p>
          : <h1 className="ios-large-title">Viajes</h1>}
        <button
          onClick={openAdd}
          className="ios-btn-primary whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" /> Nuevo viaje
        </button>
      </div>

      {trips.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Plane className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <div className="font-medium">No hay viajes planificados</div>
          <button onClick={openAdd} className="ios-btn-primary mt-3 mx-auto">
            <Plus className="w-4 h-4" /> Planificar un viaje
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {trips.map(trip => {
            const status = getTripStatus(trip)
            return (
              <div key={trip.id} className="ios-card overflow-hidden">
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
                        <div className="text-sm text-gray-500 mt-0.5 flex items-center gap-1.5"><MapPin className="w-[18px]" /> {trip.destination}</div>
                      )}
                      {(trip.start_date || trip.end_date) && (
                        <div className="text-sm text-gray-400 mt-0.5 flex items-center gap-1.5">
                          <Calendar className="w-[18px]" /> {trip.start_date || '?'} {trip.end_date ? `→ ${trip.end_date}` : ''}
                        </div>
                      )}
                      {trip.notes && (
                        <div className="text-sm text-gray-400 mt-1 italic">{trip.notes}</div>
                      )}
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => openEdit(trip)} className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-black/5"><SquarePen className="w-[18px]" /></button>
                      <button onClick={() => handleDelete(trip)} className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-black/5"><Trash2 className="w-[18px]" /></button>
                    </div>
                  </div>

                  {/* Suitcases */}
                  <div className="mt-3 pt-3 border-t border-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                        Maletas para este viaje
                        {tripGarmentCount(trip) > 0 && (
                          <span className="inline-flex items-center gap-1 text-gray-400">
                            · <Shirt className="w-3 h-3" /> {tripGarmentCount(trip)} prendas
                          </span>
                        )}
                      </div>
                      {trip.suitcases.length > 0 && (
                        <button
                          onClick={() => { setArriveTarget(''); setArrivingTrip(trip) }}
                          className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-full px-2.5 py-1"
                        >
                          <PlaneLanding className="w-3.5 h-3.5" /> Marcar llegada
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {suitcases.map(s => {
                        const linked = trip.suitcases.some(ts => ts.id === s.id)
                        return (
                          <button
                            key={s.id}
                            onClick={() => toggleSuitcase(trip, s.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                              linked
                                ? 'border-brand-300 bg-brand-50 text-brand-700'
                                : 'border-gray-200 text-gray-500 hover:border-gray-300'
                            }`}
                          >
                            <Luggage className="w-3.5" /> {s.name}
                            {linked && <Check className="w-3.5" />}
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
                        <span key={s.id} className="mr-3 inline-flex items-center gap-1">
                          <Luggage className="w-3.5" /> {s.name} {s.garment_count ? `(${s.garment_count} prendas)` : ''}
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
                className="ios-field"
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
                className="ios-field"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha inicio</label>
                <input
                  type="date"
                  value={form.start_date}
                  onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                  className="ios-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha fin</label>
                <input
                  type="date"
                  value={form.end_date}
                  onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
                  className="ios-field"
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
                className="ios-field resize-none"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => { setShowAdd(false); setEditing(null) }} className="flex-1 py-2.5 rounded-xl bg-black/[0.06] text-gray-700 font-semibold">Cancelar</button>
              <button onClick={handleSave} className="ios-btn-primary flex-1 py-2.5">Guardar</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Marcar llegada → mover maletas del viaje a una casa */}
      {arrivingTrip && (
        <Modal title={`Llegada de "${arrivingTrip.name}"`} onClose={() => setArrivingTrip(null)} size="sm">
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              ¿A qué casa han llegado las maletas de este viaje? Se moverán
              {' '}<strong>{arrivingTrip.suitcases.length}</strong> maleta(s) y toda su ropa.
            </p>
            <div className="space-y-2">
              {locations.map(l => (
                <button
                  key={l.id}
                  onClick={() => setArriveTarget(String(l.id))}
                  className={`w-full p-3 rounded-xl border text-sm text-left transition-all flex items-center gap-2 ${
                    arriveTarget === String(l.id) ? 'border-brand-300 bg-brand-50 text-brand-700' : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <MapPin className="w-4 h-4" /> {l.name} — {l.city}
                </button>
              ))}
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={() => setArrivingTrip(null)} className="flex-1 py-2.5 rounded-xl bg-black/[0.06] text-gray-700 font-semibold">Cancelar</button>
              <button onClick={handleArrive} disabled={!arriveTarget} className="ios-btn-primary flex-1 py-2.5 disabled:opacity-50">Confirmar llegada</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
