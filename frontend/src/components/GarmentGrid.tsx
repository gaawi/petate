import { useState } from 'react'
import { LayoutGrid, Grid3x3, List } from 'lucide-react'
import type { Garment } from '../types'
import GarmentCard from './GarmentCard'

export type ViewMode = 'comoda' | 'densa' | 'lista'

interface Props {
  garments: Garment[]
  onEdit: (g: Garment) => void
  onDelete: (g: Garment) => void
  onDuplicate?: (g: Garment) => void
  empty?: React.ReactNode
}

// Cuadrícula de prendas con selector de vista (cómoda / densa / lista).
// La preferencia se comparte con el resto de la app vía localStorage.
export default function GarmentGrid({ garments, onEdit, onDelete, onDuplicate, empty }: Props) {
  const [view, setView] = useState<ViewMode>(() => (localStorage.getItem('petate-view-2') as ViewMode) || 'lista')
  const chooseView = (v: ViewMode) => { setView(v); localStorage.setItem('petate-view-2', v) }

  return (
    <div>
      {garments.length > 0 && (
      <div className="flex items-center justify-end mb-3">
        <div className="inline-flex p-0.5 bg-black/[0.06] rounded-lg">
          {([
            { v: 'comoda', Icon: LayoutGrid, label: 'Cómoda' },
            { v: 'densa', Icon: Grid3x3, label: 'Densa' },
            { v: 'lista', Icon: List, label: 'Lista' },
          ] as const).map(({ v, Icon, label }) => (
            <button
              key={v}
              onClick={() => chooseView(v)}
              aria-label={label}
              className={`w-8 h-7 flex items-center justify-center rounded-md transition-all ${
                view === v ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'
              }`}
            >
              <Icon className="w-[18px] h-[18px]" />
            </button>
          ))}
        </div>
      </div>
      )}

      {garments.length === 0 ? (
        empty ?? null
      ) : view === 'lista' ? (
        <div className="space-y-2">
          {garments.map(g => (
            <GarmentCard key={g.id} garment={g} layout="list" onEdit={onEdit} onDelete={onDelete} onDuplicate={onDuplicate} />
          ))}
        </div>
      ) : (
        <div className={`grid gap-3 ${
          view === 'densa'
            ? 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6'
            : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
        }`}>
          {garments.map(g => (
            <GarmentCard key={g.id} garment={g} onEdit={onEdit} onDelete={onDelete} onDuplicate={onDuplicate} />
          ))}
        </div>
      )}
    </div>
  )
}
