import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../api'
import type { Garment, FamilyMember, Wardrobe, Suitcase } from '../types'
import { CATEGORIES, USE_TYPES, CONDITIONS, SEASONS, FIT_OPTIONS } from '../types'
import GarmentCard from '../components/GarmentCard'
import GarmentForm from '../components/GarmentForm'
import Modal from '../components/Modal'
import { Plus, Search, ChevronDown } from 'lucide-react'

export default function Garments() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [garments, setGarments] = useState<Garment[]>([])
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [wardrobes, setWardrobes] = useState<Wardrobe[]>([])
  const [suitcases, setSuitcases] = useState<Suitcase[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Garment | null>(null)
  const [search, setSearch] = useState(searchParams.get('search') || '')

  const filters = {
    owner_id: searchParams.get('owner_id') || '',
    category: searchParams.get('category') || '',
    season: searchParams.get('season') || '',
    use_type: searchParams.get('use_type') || '',
    condition: searchParams.get('condition') || '',
    fit: searchParams.get('fit') || '',
  }

  const setFilter = (key: string, val: string) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      if (val) next.set(key, val)
      else next.delete(key)
      return next
    })
  }

  const clearFilters = () => setSearchParams({})

  const activeFilterCount = Object.values(filters).filter(Boolean).length + (search ? 1 : 0)

  useEffect(() => {
    Promise.all([api.members.list(), api.wardrobes.list(), api.suitcases.list()]).then(([m, w, s]) => {
      setMembers(m)
      setWardrobes(w)
      setSuitcases(s)
    })
  }, [])

  useEffect(() => {
    setLoading(true)
    const f: Record<string, string> = {}
    if (filters.owner_id) f.owner_id = filters.owner_id
    if (filters.category) f.category = filters.category
    if (filters.season) f.season = filters.season
    if (filters.use_type) f.use_type = filters.use_type
    if (filters.condition) f.condition = filters.condition
    if (filters.fit) f.fit = filters.fit
    if (search) f.search = search
    api.garments.list(f).then(g => { setGarments(g); setLoading(false) }).catch(() => setLoading(false))
  }, [searchParams, search])

  const handleSave = (g: Garment) => {
    setGarments(prev => {
      const idx = prev.findIndex(x => x.id === g.id)
      return idx >= 0 ? prev.map(x => x.id === g.id ? g : x) : [g, ...prev]
    })
    setShowForm(false)
    setEditing(null)
  }

  const handleDelete = async (g: Garment) => {
    if (!confirm(`¿Eliminar "${g.name}"?`)) return
    await api.garments.delete(g.id)
    setGarments(prev => prev.filter(x => x.id !== g.id))
  }

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="ios-large-title">Ropa</h1>
          <p className="text-sm text-gray-400">{garments.length} prendas</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true) }}
          className="ios-btn-primary flex items-center gap-1.5"
        >
          <Plus className="w-5 h-5" /> Añadir
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre, marca..."
          className="ios-field w-full pl-10"
        />
      </div>

      {/* Filters */}
      <div className="space-y-2 mb-4">
        {/* Owner filter */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setFilter('owner_id', '')}
            className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${!filters.owner_id ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Todos
          </button>
          {members.map(m => (
            <button
              key={m.id}
              onClick={() => setFilter('owner_id', filters.owner_id === String(m.id) ? '' : String(m.id))}
              className="flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors text-white"
              style={{
                backgroundColor: filters.owner_id === String(m.id) ? m.color : '#e5e7eb',
                color: filters.owner_id === String(m.id) ? 'white' : '#6b7280',
              }}
            >
              {m.name}
            </button>
          ))}
        </div>

        {/* More filters row */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <FilterChip label="Temporada" value={filters.season} options={SEASONS.map(s => ({ value: s.value, label: `${s.emoji} ${s.label}` }))} onChange={v => setFilter('season', v)} />
          <FilterChip label="Uso" value={filters.use_type} options={USE_TYPES.map(u => ({ value: u.value, label: `${u.emoji} ${u.label}` }))} onChange={v => setFilter('use_type', v)} />
          <FilterChip label="Estado" value={filters.condition} options={CONDITIONS.map(c => ({ value: c.value, label: c.label }))} onChange={v => setFilter('condition', v)} />
          <FilterChip label="Talla" value={filters.fit} options={FIT_OPTIONS.map(f => ({ value: f.value, label: `${f.emoji} ${f.label}` }))} onChange={v => setFilter('fit', v)} />
          <FilterChip label="Tipo" value={filters.category} options={CATEGORIES.map(c => ({ value: c.value, label: `${c.emoji} ${c.label}` }))} onChange={v => setFilter('category', v)} />
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs text-red-600 bg-red-50 hover:bg-red-100 transition-colors font-medium"
            >
              Limpiar ({activeFilterCount})
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-12 text-gray-400">Cargando...</div>
      ) : garments.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">👕</div>
          <div className="font-medium">No hay prendas{activeFilterCount > 0 ? ' con esos filtros' : ''}</div>
          {activeFilterCount > 0 && (
            <button onClick={clearFilters} className="mt-2 text-brand-600 text-sm hover:underline">
              Limpiar filtros
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {garments.map(g => (
            <GarmentCard
              key={g.id}
              garment={g}
              onEdit={g => { setEditing(g); setShowForm(true) }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <Modal
          title={editing ? 'Editar prenda' : 'Nueva prenda'}
          onClose={() => { setShowForm(false); setEditing(null) }}
          size="xl"
        >
          <GarmentForm
            garment={editing ?? undefined}
            members={members}
            wardrobes={wardrobes}
            suitcases={suitcases}
            onSave={handleSave}
            onClose={() => { setShowForm(false); setEditing(null) }}
          />
        </Modal>
      )}
    </div>
  )
}

function FilterChip({
  label, value, options, onChange,
}: {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  const selected = options.find(o => o.value === value)

  return (
    <div className="relative flex-shrink-0">
      <button
        onClick={() => setOpen(!open)}
        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1 ${
          value ? 'bg-brand-600 text-white' : 'bg-black/[0.05] text-gray-600'
        }`}
      >
        {selected ? selected.label : label}
        <ChevronDown className="w-3.5 h-3.5" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="ios-card absolute top-full left-0 mt-1 rounded-xl shadow-lg z-20 min-w-40 max-h-64 overflow-y-auto">
            <button
              onClick={() => { onChange(''); setOpen(false) }}
              className="block w-full text-left px-3 py-2 text-xs text-gray-500 hover:bg-gray-50"
            >
              Todos
            </button>
            {options.map(o => (
              <button
                key={o.value}
                onClick={() => { onChange(o.value === value ? '' : o.value); setOpen(false) }}
                className={`block w-full text-left px-3 py-2 text-xs transition-colors ${
                  o.value === value ? 'bg-brand-50 text-brand-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
