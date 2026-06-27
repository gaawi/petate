import { useState, useRef, useEffect } from 'react'
import type { Garment, FamilyMember, Wardrobe, Suitcase } from '../types'
import { CATEGORIES, USE_TYPES, CONDITIONS, FIT_OPTIONS, SEASONS } from '../types'
import { api } from '../api'

interface Props {
  garment?: Garment
  members: FamilyMember[]
  wardrobes: Wardrobe[]
  suitcases: Suitcase[]
  onSave: (g: Garment) => void
  onClose: () => void
}

const defaultForm = {
  name: '', category: 'camiseta', owner_id: '' as number | '',
  storage_type: 'wardrobe' as 'wardrobe' | 'suitcase' | 'none',
  wardrobe_id: '' as number | '', suitcase_id: '' as number | '',
  photo_path: '', condition: 'buena', use_type: 'salir',
  fit: 'bien', season: 'todo', rating: 3, brand: '', color: '', notes: '',
}

function OptionGroup<T extends string>({
  options, value, onChange, small,
}: {
  options: readonly { value: T; label: string; emoji?: string }[]
  value: T
  onChange: (v: T) => void
  small?: boolean
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map(o => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`px-2.5 py-1 rounded-lg border text-sm transition-all ${
            value === o.value
              ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-medium'
              : 'border-gray-200 text-gray-600 hover:border-gray-300'
          } ${small ? 'text-xs px-2 py-0.5' : ''}`}
        >
          {o.emoji && <span className="mr-1">{o.emoji}</span>}
          {o.label}
        </button>
      ))}
    </div>
  )
}

export default function GarmentForm({ garment, members, wardrobes, suitcases, onSave, onClose }: Props) {
  const [form, setForm] = useState(() => {
    if (!garment) return defaultForm
    return {
      name: garment.name,
      category: garment.category,
      owner_id: garment.owner_id ?? ('' as number | ''),
      storage_type: garment.wardrobe_id ? 'wardrobe' : garment.suitcase_id ? 'suitcase' : 'none' as 'wardrobe' | 'suitcase' | 'none',
      wardrobe_id: garment.wardrobe_id ?? ('' as number | ''),
      suitcase_id: garment.suitcase_id ?? ('' as number | ''),
      photo_path: garment.photo_path ?? '',
      condition: garment.condition,
      use_type: garment.use_type,
      fit: garment.fit,
      season: garment.season,
      rating: garment.rating,
      brand: garment.brand ?? '',
      color: garment.color ?? '',
      notes: garment.notes ?? '',
    }
  })

  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const set = (key: keyof typeof form, val: unknown) => setForm(f => ({ ...f, [key]: val }))

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return
    setUploading(true)
    try {
      const path = await api.upload(file)
      set('photo_path', path)
    } catch (e) {
      alert('Error subiendo la foto')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    try {
      const payload: Partial<Garment> = {
        name: form.name.trim(),
        category: form.category,
        owner_id: form.owner_id !== '' ? Number(form.owner_id) : null,
        wardrobe_id: form.storage_type === 'wardrobe' && form.wardrobe_id !== '' ? Number(form.wardrobe_id) : null,
        suitcase_id: form.storage_type === 'suitcase' && form.suitcase_id !== '' ? Number(form.suitcase_id) : null,
        photo_path: form.photo_path || null,
        condition: form.condition,
        use_type: form.use_type,
        fit: form.fit,
        season: form.season,
        rating: form.rating,
        brand: form.brand.trim() || null,
        color: form.color.trim() || null,
        notes: form.notes.trim() || null,
      }
      const saved = garment
        ? await api.garments.update(garment.id, payload)
        : await api.garments.create(payload)
      onSave(saved)
    } catch (e) {
      alert('Error guardando la prenda')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Photo upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Foto</label>
        <div
          className={`relative border-2 border-dashed rounded-xl overflow-hidden transition-colors ${
            dragOver ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
          }`}
          style={{ height: form.photo_path ? 'auto' : '140px' }}
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => {
            e.preventDefault()
            setDragOver(false)
            const file = e.dataTransfer.files[0]
            if (file) handleFile(file)
          }}
          onClick={() => fileRef.current?.click()}
        >
          {form.photo_path ? (
            <div className="relative">
              <img src={form.photo_path} alt="Preview" className="w-full max-h-64 object-contain" />
              <button
                type="button"
                onClick={e => { e.stopPropagation(); set('photo_path', '') }}
                className="absolute top-2 right-2 p-1 bg-white rounded-full shadow text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400 cursor-pointer">
              {uploading ? (
                <div className="text-sm">Subiendo...</div>
              ) : (
                <>
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm">Haz clic o arrastra una foto</span>
                </>
              )}
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
          />
        </div>
      </div>

      {/* Name + brand */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={e => set('name', e.target.value)}
            placeholder="Ej: Camiseta azul Nike"
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
          <input
            type="text"
            value={form.brand}
            onChange={e => set('brand', e.target.value)}
            placeholder="Ej: Zara, Nike..."
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de prenda</label>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map(c => (
            <button
              key={c.value}
              type="button"
              onClick={() => set('category', c.value)}
              className={`px-2 py-1 rounded-lg border text-xs transition-all ${
                form.category === c.value
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-medium'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {c.emoji} {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Owner */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Dueño/a</label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => set('owner_id', '')}
            className={`px-3 py-1.5 rounded-xl border text-sm transition-all ${
              form.owner_id === '' ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-medium' : 'border-gray-200 text-gray-500'
            }`}
          >
            Todos
          </button>
          {members.map(m => (
            <button
              key={m.id}
              type="button"
              onClick={() => set('owner_id', m.id)}
              className={`px-3 py-1.5 rounded-xl border text-sm font-medium transition-all ${
                form.owner_id === m.id ? 'text-white border-transparent' : 'border-gray-200 text-gray-600'
              }`}
              style={form.owner_id === m.id ? { backgroundColor: m.color, borderColor: m.color } : {}}
            >
              {m.name}
            </button>
          ))}
        </div>
      </div>

      {/* Storage location */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Ubicación</label>
        <div className="flex gap-2 mb-2">
          {[
            { value: 'wardrobe', label: '🚪 Armario' },
            { value: 'suitcase', label: '🧳 Maleta' },
            { value: 'none', label: 'Sin ubicar' },
          ].map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => set('storage_type', opt.value)}
              className={`px-3 py-1.5 rounded-xl border text-sm transition-all ${
                form.storage_type === opt.value
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-medium'
                  : 'border-gray-200 text-gray-600'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {form.storage_type === 'wardrobe' && (
          <select
            value={form.wardrobe_id}
            onChange={e => set('wardrobe_id', e.target.value ? Number(e.target.value) : '')}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            <option value="">Selecciona un armario</option>
            {wardrobes.map(w => (
              <option key={w.id} value={w.id}>
                {w.name}{w.location_name ? ` (${w.location_name})` : ''}
              </option>
            ))}
          </select>
        )}
        {form.storage_type === 'suitcase' && (
          <select
            value={form.suitcase_id}
            onChange={e => set('suitcase_id', e.target.value ? Number(e.target.value) : '')}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            <option value="">Selecciona una maleta</option>
            {suitcases.map(s => (
              <option key={s.id} value={s.id}>
                {s.name}{s.location_name ? ` (${s.location_name})` : ''}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Season */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Temporada</label>
        <OptionGroup options={SEASONS} value={form.season} onChange={v => set('season', v)} />
      </div>

      {/* Use type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Para qué sirve</label>
        <OptionGroup options={USE_TYPES} value={form.use_type} onChange={v => set('use_type', v)} />
      </div>

      {/* Condition */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
        <OptionGroup options={CONDITIONS} value={form.condition} onChange={v => set('condition', v)} />
      </div>

      {/* Fit */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Talla / Cómo me queda</label>
        <OptionGroup options={FIT_OPTIONS} value={form.fit} onChange={v => set('fit', v)} />
      </div>

      {/* Rating */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Valoración</label>
        <div className="flex gap-2 items-center">
          {[1, 2, 3, 4, 5].map(i => (
            <button
              key={i}
              type="button"
              onClick={() => set('rating', i)}
              className={`text-2xl transition-transform hover:scale-110 ${i <= form.rating ? 'text-amber-400' : 'text-gray-200'}`}
            >
              ★
            </button>
          ))}
          <span className="text-sm text-gray-400 ml-2">
            {['', 'No me gusta', 'Regular', 'Bien', 'Me gusta', 'Me encanta'][form.rating]}
          </span>
        </div>
      </div>

      {/* Color + Notes */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
          <input
            type="text"
            value={form.color}
            onChange={e => set('color', e.target.value)}
            placeholder="Ej: azul marino"
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
          <input
            type="text"
            value={form.notes}
            onChange={e => set('notes', e.target.value)}
            placeholder="Notas adicionales..."
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2 sticky bottom-0 bg-white pb-2">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={saving || !form.name.trim()}
          className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Guardando...' : garment ? 'Actualizar' : 'Añadir prenda'}
        </button>
      </div>
    </form>
  )
}
