import { useRef, useState } from 'react'

export interface SwipeAction {
  key: string
  label: string
  icon: React.ReactNode
  bg: string        // clase de fondo (ej. 'bg-brand-600')
  onClick: () => void
}

interface Props {
  actions: SwipeAction[]
  children: React.ReactNode
}

const ACTION_W = 78 // px por acción

// Fila deslizable estilo iOS: arrastra hacia la izquierda para revelar acciones.
export default function SwipeableRow({ actions, children }: Props) {
  const openW = actions.length * ACTION_W
  const [offset, setOffset] = useState(0)
  const [dragging, setDragging] = useState(false)
  const start = useRef<{ x: number; y: number; base: number; dir: null | 'h' | 'v' }>({ x: 0, y: 0, base: 0, dir: null })

  const onDown = (e: React.PointerEvent) => {
    start.current = { x: e.clientX, y: e.clientY, base: offset, dir: null }
    setDragging(true)
  }
  const onMove = (e: React.PointerEvent) => {
    if (!dragging) return
    const dx = e.clientX - start.current.x
    const dy = e.clientY - start.current.y
    if (start.current.dir === null && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) {
      start.current.dir = Math.abs(dx) > Math.abs(dy) ? 'h' : 'v'
      if (start.current.dir === 'h') e.currentTarget.setPointerCapture(e.pointerId)
    }
    if (start.current.dir !== 'h') return
    setOffset(Math.max(-openW, Math.min(0, start.current.base + dx)))
  }
  const onUp = () => {
    if (!dragging) return
    setDragging(false)
    if (start.current.dir === 'h') setOffset(offset < -openW / 2 ? -openW : 0)
  }

  const close = () => setOffset(0)

  return (
    <div className="relative overflow-hidden rounded-2xl ios-card">
      {/* Acciones detrás */}
      <div className="absolute inset-y-0 right-0 flex">
        {actions.map(a => (
          <button
            key={a.key}
            onClick={() => { a.onClick(); close() }}
            style={{ width: ACTION_W }}
            className={`flex flex-col items-center justify-center gap-1 text-white text-xs font-medium ${a.bg}`}
          >
            {a.icon}
            {a.label}
          </button>
        ))}
      </div>

      {/* Contenido en primer plano */}
      <div
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onClick={() => { if (offset !== 0) close() }}
        style={{
          transform: `translateX(${offset}px)`,
          transition: dragging ? 'none' : 'transform 0.28s cubic-bezier(0.32,0.72,0,1)',
          touchAction: 'pan-y',
        }}
        className="relative bg-white"
      >
        {children}
      </div>
    </div>
  )
}
