import { ReactNode, useEffect } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  footer?: ReactNode
}

export default function Modal({ isOpen, onClose, title, description, children, size = 'md', footer }: ModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (isOpen) {
      document.addEventListener('keydown', onKey)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Panel — sur mobile s'ouvre depuis le bas (bottom sheet) */}
      <div className={[
        'relative w-full flex flex-col animate-scale-in',
        'bg-white dark:bg-slate-900',
        'border border-slate-200/60 dark:border-slate-700/60',
        'shadow-modal',
        // Mobile: arrondi en haut seulement
        'rounded-t-2xl sm:rounded-2xl',
        // Desktop: taille limitée
        `sm:${sizes[size]}`,
        // Hauteur max pour éviter de dépasser l'écran
        'max-h-[90vh]',
      ].join(' ')}>

        {/* Poignée mobile */}
        <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 bg-slate-200 dark:bg-slate-700 rounded-full" />
        </div>

        {/* Header */}
        {(title || description) && (
          <div className="flex items-start justify-between px-6 pt-4 pb-4 border-b border-slate-100 dark:border-slate-700/60 shrink-0">
            <div>
              {title && (
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h3>
              )}
              {description && (
                <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{description}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="ml-4 rounded-lg p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>

        {/* Footer sticky (optionnel) */}
        {footer && (
          <div className="shrink-0 px-6 py-4 border-t border-slate-100 dark:border-slate-700/60 bg-white dark:bg-slate-900 rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
