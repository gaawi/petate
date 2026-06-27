import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plane, Luggage } from 'lucide-react'
import Trips from './Trips'
import Suitcases from './Suitcases'

type Seg = 'viajes' | 'maletas'

export default function Travel() {
  const [params, setParams] = useSearchParams()
  const initial: Seg = params.get('seg') === 'maletas' ? 'maletas' : 'viajes'
  const [seg, setSeg] = useState<Seg>(initial)

  const choose = (s: Seg) => {
    setSeg(s)
    setParams(s === 'viajes' ? {} : { seg: s }, { replace: true })
  }

  const tabs: { key: Seg; label: string; Icon: typeof Plane }[] = [
    { key: 'viajes', label: 'Viajes', Icon: Plane },
    { key: 'maletas', label: 'Maletas', Icon: Luggage },
  ]

  return (
    <div className="p-4 md:p-6">
      <h1 className="ios-large-title mb-4">Viajes</h1>

      {/* Control segmentado estilo iOS */}
      <div className="inline-flex w-full max-w-xs p-1 bg-black/[0.06] rounded-xl mb-5">
        {tabs.map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => choose(key)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              seg === key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
            }`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {seg === 'viajes' ? <Trips embedded /> : <Suitcases embedded />}
    </div>
  )
}
