import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef, type ReactNode } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, hint, id, leftIcon, ...props }, ref) => {
    return (
      <div className="w-full"> {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
          > {label}
          </label> )}
        <div className="relative"> {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500"> {leftIcon}
            </div> )}
          <input
            ref={ref}
            id={id}
            className={[
              'w-full rounded-xl border px-3.5 py-2.5 text-sm',
              'bg-slate-50 text-slate-900 placeholder:text-slate-400',
              'dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500',
              'transition-all duration-150 outline-none',
              'focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500',
              'dark:focus:ring-primary-400/30 dark:focus:border-primary-400',
              error
                ? 'border-danger-400 dark:border-danger-500 focus:ring-danger-400/30 focus:border-danger-400'
                : 'border-slate-300 dark:border-slate-600',
              leftIcon ? 'pl-10' : '',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              className,
            ].join(' ')}
            {...props}
          /> </div> {error && (
          <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-danger-600 dark:text-danger-400"> <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"> <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /> </svg> {error}
          </p> )}
        {hint && !error && (
          <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">{hint}</p> )}
      </div> )
  }
)

Input.displayName = 'Input'
export default Input

/* ── Textarea variant ── */
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', label, error, id, ...props }, ref) => (
    <div className="w-full"> {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"> {label}
        </label> )}
      <textarea
        ref={ref}
        id={id}
            className={[
              'w-full rounded-xl border px-3.5 py-2.5 text-sm resize-none',
          'bg-slate-50 text-slate-900 placeholder:text-slate-400',
          'dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500',
          'transition-all duration-150 outline-none',
          'focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500',
          'dark:focus:ring-primary-400/30 dark:focus:border-primary-400',
          error ? 'border-danger-400 dark:border-danger-500' : 'border-slate-300 dark:border-slate-600',
          className,
        ].join(' ')}
        {...props}
      /> {error && <p className="mt-1.5 text-xs font-medium text-danger-600 dark:text-danger-400">{error}</p>}
    </div> )
)
Textarea.displayName = 'Textarea'
