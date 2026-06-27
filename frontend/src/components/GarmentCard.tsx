import type { Garment } from '../types'
import { getCategoryInfo, getConditionInfo, getSeasonInfo, getUseTypeInfo, getFitInfo } from '../types'

interface Props {
  garment: Garment
  onEdit: (g: Garment) => void
  onDelete: (g: Garment) => void
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={`text-xs ${i <= rating ? 'text-amber-400' : 'text-gray-200'}`}>★</span>
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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow">
      {/* Photo */}
      <div className="relative aspect-[3/4] bg-gray-50 overflow-hidden">
        {garment.photo_path ? (
          <img
            src={garment.photo_path}
            alt={garment.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-6xl opacity-30">{cat.emoji}</span>
          </div>
        )}
        {/* Owner badge */}
        {garment.owner_name && (
          <div
            className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-white text-xs font-medium shadow-sm"
            style={{ backgroundColor: garment.owner_color || '#6366f1' }}
          >
            {garment.owner_name}
          </div>
        )}
        {/* Actions on hover */}
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(garment)}
            className="p-1.5 bg-white rounded-lg shadow text-gray-600 hover:text-indigo-600 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(garment)}
            className="p-1.5 bg-white rounded-lg shadow text-gray-600 hover:text-red-600 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
        {/* Rating */}
        <div className="absolute bottom-2 left-2">
          <Stars rating={garment.rating} />
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="font-semibold text-sm text-gray-900 truncate">{garment.name}</div>
        {garment.brand && <div className="text-xs text-gray-400 truncate">{garment.brand}</div>}

        <div className="mt-2 flex flex-wrap gap-1">
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-gray-100 rounded text-xs text-gray-600">
            {cat.emoji} {cat.label}
          </span>
          <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${cond.color}`}>
            {cond.label}
          </span>
          <span className="px-1.5 py-0.5 bg-sky-50 text-sky-700 rounded text-xs">
            {season.emoji} {season.label}
          </span>
          <span className="px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded text-xs">
            {useType.emoji} {useType.label}
          </span>
          {garment.fit !== 'bien' && (
            <span className="px-1.5 py-0.5 bg-orange-50 text-orange-700 rounded text-xs">
              {fit.emoji} {fit.label}
            </span>
          )}
        </div>

        {locationStr && (
          <div className="mt-2 text-xs text-gray-400 flex items-center gap-1 truncate">
            <span>📍</span>
            <span className="truncate">{locationStr}</span>
          </div>
        )}
      </div>
    </div>
  )
}
