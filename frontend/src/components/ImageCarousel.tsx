import { useRef, useState } from 'react'

interface Props {
  photos: string[]
  alt: string
  className?: string
}

// Carrusel de fotos con desplazamiento horizontal (snap) y puntos.
export default function ImageCarousel({ photos, alt, className = '' }: Props) {
  const [idx, setIdx] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  const onScroll = () => {
    const el = ref.current
    if (!el) return
    const i = Math.round(el.scrollLeft / el.clientWidth)
    if (i !== idx) setIdx(i)
  }

  return (
    <div className={`relative ${className}`}>
      <div
        ref={ref}
        onScroll={onScroll}
        className="flex h-full w-full overflow-x-auto snap-x snap-mandatory no-scrollbar"
        style={{ scrollBehavior: 'smooth' }}
      >
        {photos.map((p, i) => (
          <img
            key={i}
            src={p}
            alt={`${alt} ${i + 1}`}
            className="min-w-full w-full h-full object-cover snap-center"
            draggable={false}
          />
        ))}
      </div>

      {photos.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 px-1.5 py-1 rounded-full bg-black/25 backdrop-blur-sm">
          {photos.map((_, i) => (
            <span
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${i === idx ? 'bg-white' : 'bg-white/45'}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
