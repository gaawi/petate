import { useState, useRef, useEffect } from 'react'
import type { ComponentType } from 'react'
import { ImagePlus, X, Star, DoorOpen, Luggage, Ban, Minus, Plus } from 'lucide-react'
import type { Garment, FamilyMember, Wardrobe, Suitcase } from '../types'
import { CATEGORIES, USE_TYPES, CONDITIONS, FIT_OPTIONS, SEASONS } from '../types'
import { api } from '../api'
import { CategoryIcon, SeasonIcon, UseTypeIcon, FitIcon } from './icons'

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
  fit: 'bien', season: 'todo', rating: 3, quantity: 1, brand: '', color: '', notes: '',
}

function OptionGroup<T extends string>({
  options, value, onChange, small, Icon,
}: {
  options: readonly { value: T; label: string; emoji?: string }[]
  value: T
  onChange: (v: T) => void
  small?: boolean
  Icon?: ComponentType<{ value: string; className?: string }>
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map(o => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-sm transition-all ${
            value === o.value
              ? 'border-brand-500 bg-brand-50 text-brand-700 font-medium'
              : 'border-gray-200 text-gray-600 hover:border-gray-300'
          } ${small ? 'text-xs px-2 py-0.5' : ''}`}
        >
          {Icon && <Icon value={o.value} className="w-4 h-4" />}
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
      quantity: garment.quantity ?? 1,
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
        quantity: form.quantity,
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
        <label className="block text-[13px] font-medium text-gray-500 mb-1.5">Foto</label>
        <div
          className={`relative border-2 border-dashed rounded-xl overflow-hidden transition-colors ${
            dragOver ? 'border-brand-400 bg-brand-50' : 'border-gray-200 hover:border-gray-300'
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
                className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400 cursor-pointer">
              {uploading ? (
                <div className="text-sm">Subiendo...</div>
              ) : (
                <>
                  <ImagePlus className="w-8 h-8 text-gray-400" />
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
          <label className="block text-[13px] font-medium text-gray-500 mb-1.5">Nombre *</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={e => set('name', e.target.value)}
            placeholder="Ej: Camiseta azul Nike"
            className="ios-field"
          />
        </div>
        <div>
          <label className="block text-[13px] font-medium text-gray-500 mb-1.5">Marca</label>
          <input
            type="text"
            value={form.brand}
            onChange={e => set('brand', e.target.value)}
            placeholder="Ej: Zara, Nike..."
            className="ios-field"
          />
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="block text-[13px] font-medium text-gray-500 mb-1.5">Tipo de prenda</label>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map(c => (
            <button
              key={c.value}
              type="button"
              onClick={() => set('category', c.value)}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-xs transition-all ${
                form.category === c.value
                  ? 'border-brand-500 bg-brand-50 text-brand-700 font-medium'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <CategoryIcon value={c.value} className="w-4 h-4" /> {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Owner */}
      <div>
        <label className="block text-[13px] font-medium text-gray-500 mb-1.5">Dueño/a</label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => set('owner_id', '')}
            className={`px-3 py-1.5 rounded-xl border text-sm transition-all ${
              form.owner_id === '' ? 'border-brand-500 bg-brand-50 text-brand-700 font-medium' : 'border-gray-200 text-gray-500'
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
        <label className="block text-[13px] font-medium text-gray-500 mb-1.5">Ubicación</label>
        <div className="flex gap-2 mb-2">
          {[
            { value: 'wardrobe', label: 'Armario', Icon: DoorOpen },
            { value: 'suitcase', label: 'Maleta', Icon: Luggage },
            { value: 'none', label: 'Sin ubicar', Icon: Ban },
          ].map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => set('storage_type', opt.value)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm transition-all ${
                form.storage_type === opt.value
                  ? 'border-brand-500 bg-brand-50 text-brand-700 font-medium'
                  : 'border-gray-200 text-gray-600'
              }`}
            >
              <opt.Icon className="w-4 h-4" /> {opt.label}
            </button>
          ))}
        </div>
        {form.storage_type === 'wardrobe' && (
          <select
            value={form.wardrobe_id}
            onChange={e => set('wardrobe_id', e.target.value ? Number(e.target.value) : '')}
            className="ios-field"
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
            className="ios-field"
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
        <label className="block text-[13px] font-medium text-gray-500 mb-1.5">Temporada</label>
        <OptionGroup options={SEASONS} value={form.season} onChange={v => set('season', v)} Icon={SeasonIcon} />
      </div>

      {/* Use type */}
      <div>
        <label className="block text-[13px] font-medium text-gray-500 mb-1.5">Para qué sirve</label>
        <OptionGroup options={USE_TYPES} value={form.use_type} onChange={v => set('use_type', v)} Icon={UseTypeIcon} />
      </div>

      {/* Condition */}
      <div>
        <label className="block text-[13px] font-medium text-gray-500 mb-1.5">Estado</label>
        <OptionGroup options={CONDITIONS} value={form.condition} onChange={v => set('condition', v)} />
      </div>

      {/* Fit */}
      <div>
        <label className="block text-[13px] font-medium text-gray-500 mb-1.5">Talla / Cómo me queda</label>
        <OptionGroup options={FIT_OPTIONS} value={form.fit} onChange={v => set('fit', v)} Icon={FitIcon} />
      </div>

      {/* Rating */}
      <div>
        <label className="block text-[13px] font-medium text-gray-500 mb-1.5">Valoración</label>
        <div className="flex gap-2 items-center">
          {[1, 2, 3, 4, 5].map(i => (
            <button
              key={i}
              type="button"
              onClick={() => set('rating', i)}
              className="transition-transform hover:scale-110"
            >
              <Star className={`w-7 h-7 ${i <= form.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
            </button>
          ))}
          <span className="text-sm text-gray-400 ml-2">
            {['', 'No me gusta', 'Regular', 'Bien', 'Me gusta', 'Me encanta'][form.rating]}
          </span>
        </div>
      </div>

      {/* Cantidad */}
      <div>
        <label className="block text-[13px] font-medium text-gray-500 mb-1.5">Cantidad (prendas iguales)</label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => set('quantity', Math.max(1, form.quantity - 1))}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-black/[0.06] text-gray-700 disabled:opacity-40"
            disabled={form.quantity <= 1}
          >
            <Minus className="w-4 h-4" strokeWidth={2.5} />
          </button>
          <span className="w-10 text-center text-lg font-semibold text-gray-900">{form.quantity}</span>
          <button
            type="button"
            onClick={() => set('quantity', form.quantity + 1)}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-black/[0.06] text-gray-700"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Color + Notes */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[13px] font-medium text-gray-500 mb-1.5">Color</label>
          <input
            type="text"
            value={form.color}
            onChange={e => set('color', e.target.value)}
            placeholder="Ej: azul marino"
            className="ios-field"
          />
        </div>
        <div>
          <label className="block text-[13px] font-medium text-gray-500 mb-1.5">Notas</label>
          <input
            type="text"
            value={form.notes}
            onChange={e => set('notes', e.target.value)}
            placeholder="Notas adicionales..."
            className="ios-field"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2 sticky bottom-0 bg-white pb-2">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-2.5 rounded-xl bg-black/[0.06] text-gray-700 font-semibold"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={saving || !form.name.trim()}
          className="ios-btn-primary flex-1 py-2.5 disabled:opacity-50"
        >
          {saving ? 'Guardando...' : garment ? 'Actualizar' : 'Añadir prenda'}
        </button>
      </div>
    </form>
  )
}
