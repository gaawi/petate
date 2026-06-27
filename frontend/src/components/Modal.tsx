import { useEffect } from 'react'
import { X } from 'lucide-react'

interface Props {
  title: string
  onClose: () => void
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export default function Modal({ title, onClose, children, size = 'md' }: Props) {
  useEffect(() => {
    const handle = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handle)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handle)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const widths = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-3xl' }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={onClose} />
      <div
        className={`relative bg-white w-full ${widths[size]} flex flex-col
          rounded-t-3xl md:rounded-3xl shadow-2xl
          max-h-[92vh] md:max-h-[88vh]
          animate-sheet-up md:animate-sheet-center`}
      >
        {/* Asa (grabber) estilo iOS — solo móvil */}
        <div className="md:hidden flex justify-center pt-2.5 pb-1">
          <div className="w-9 h-1.5 rounded-full bg-black/15" />
        </div>

        <div className="flex items-center justify-between px-5 pt-2 pb-3 md:pt-5">
          <h2 className="text-[17px] font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-black/[0.06] text-gray-500 hover:bg-black/10 transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-[18px] h-[18px]" strokeWidth={2.4} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 pb-[calc(20px+var(--safe-bottom))]">
          {children}
        </div>
      </div>
    </div>
  )
}
