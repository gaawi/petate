import { SquarePen, Trash2, Star, MapPin } from 'lucide-react'
import type { Garment } from '../types'
import { getCategoryInfo, getConditionInfo, getSeasonInfo, getUseTypeInfo, getFitInfo } from '../types'
import { CategoryIcon, SeasonIcon, UseTypeIcon, FitIcon } from './icons'

interface Props {
  garment: Garment
  onEdit: (g: Garment) => void
  onDelete: (g: Garment) => void
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5 px-1.5 py-1 rounded-full bg-black/30 backdrop-blur-sm">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`w-3 h-3 ${i <= rating ? 'text-amber-400 fill-amber-400' : 'text-white/40'}`}
          strokeWidth={2}
        />
      ))}
    </div>
  )
}

export default function GarmentCard({ garment, onEdit, onDelete }: Props) {
  const cat = getCategoryInfo(garment.category)
  const cond = getConditionInfo(garment.condition)
  const season = getSeasonInfo(garment.season)
  const useType = getUseTypeInfo(garment.use_type)
  const fit = getFitInfo(garment.fit)

  const locationStr = garment.wardrobe_name
    ? `${garment.wardrobe_name}${garment.wardrobe_location_city ? ` · ${garment.wardrobe_location_city}` : ''}`
    : garment.suitcase_name
    ? `${garment.suitcase_name}${garment.suitcase_location_city ? ` · ${garment.suitcase_location_city}` : ''}`
    : null

  return (
    <div className="ios-card overflow-hidden group">
      {/* Foto */}
      <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
        {garment.photo_path ? (
          <img src={garment.photo_path} alt={garment.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <CategoryIcon value={garment.category} className="w-16 h-16 text-gray-300" />
          </div>
        )}

        {/* Dueño */}
        {garment.owner_name && (
          <div
            className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-white text-[11px] font-semibold shadow-sm"
            style={{ backgroundColor: garment.owner_color || '#007aff' }}
          >
            {garment.owner_name}
          </div>
        )}

        {/* Acciones */}
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(garment)}
            className="w-7 h-7 flex items-center justify-center bg-white/90 backdrop-blur rounded-full shadow text-gray-700 hover:text-brand-600 transition-colors"
            aria-label="Editar"
          >
            <SquarePen className="w-4 h-4" strokeWidth={2} />
          </button>
          <button
            onClick={() => onDelete(garment)}
            className="w-7 h-7 flex items-center justify-center bg-white/90 backdrop-blur rounded-full shadow text-gray-700 hover:text-red-600 transition-colors"
            aria-label="Eliminar"
          >
            <Trash2 className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>

        {/* Valoración */}
        <div className="absolute bottom-2 left-2">
          <Stars rating={garment.rating} />
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="font-semibold text-[15px] text-gray-900 truncate">{garment.name}</div>
        {garment.brand && <div className="text-xs text-gray-400 truncate">{garment.brand}</div>}

        <div className="mt-2 flex flex-wrap gap-1">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-black/[0.05] rounded-full text-[11px] text-gray-600">
            <CategoryIcon value={garment.category} className="w-3 h-3" /> {cat.label}
          </span>
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${cond.color}`}>
            {cond.label}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-sky-50 text-sky-700 rounded-full text-[11px]">
            <SeasonIcon value={garment.season} className="w-3 h-3" /> {season.label}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full text-[11px]">
            <UseTypeIcon value={garment.use_type} className="w-3 h-3" /> {useType.label}
          </span>
          {garment.fit !== 'bien' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-50 text-orange-700 rounded-full text-[11px]">
              <FitIcon value={garment.fit} className="w-3 h-3" /> {fit.label}
            </span>
          )}
        </div>

        {locationStr && (
          <div className="mt-2 text-xs text-gray-400 flex items-center gap-1 truncate">
            <MapPin className="w-3 h-3 flex-shrink-0" strokeWidth={2} />
            <span className="truncate">{locationStr}</span>
          </div>
        )}
      </div>
    </div>
  )
}
