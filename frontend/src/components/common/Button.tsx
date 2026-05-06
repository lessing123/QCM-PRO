import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  isLoading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const base = [
      'inline-flex items-center justify-center gap-2 font-semibold rounded-xl',
      'transition-all duration-150 focus-visible:outline-none focus-visible:ring-2',
      'focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900',
      'disabled:pointer-events-none disabled:opacity-40 select-none',
    ].join(' ')

    const variants: Record<string, string> = {
      primary:   'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 focus-visible:ring-primary-500 shadow-sm dark:bg-primary-500 dark:hover:bg-primary-600',
      secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300 focus-visible:ring-slate-400 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600',
      danger:    'bg-danger-600 text-white hover:bg-danger-700 active:bg-danger-800 focus-visible:ring-danger-500 shadow-sm dark:bg-danger-500 dark:hover:bg-danger-600',
      success:   'bg-success-600 text-white hover:bg-success-700 active:bg-success-800 focus-visible:ring-success-500 shadow-sm dark:bg-success-500 dark:hover:bg-success-600',
      outline:   'border border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100 active:bg-slate-200 focus-visible:ring-primary-500 dark:border-slate-600 dark:bg-transparent dark:text-slate-200 dark:hover:bg-slate-800',
      ghost:     'text-slate-600 hover:bg-slate-100 active:bg-slate-200 focus-visible:ring-slate-400 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200',
    }

    const sizes: Record<string, string> = {
      sm:   'h-8 px-3 text-xs',
      md:   'h-9 px-4 text-sm',
      lg:   'h-11 px-6 text-sm',
      icon: 'h-9 w-9 p-0 text-sm',
    }

    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      > {isLoading ? (
          <> <svg className="animate-spin h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24"> <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /> <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /> </svg> {typeof children === 'string' ? <span>{children}</span> : children}
          </> ) : children}
      </button> )
  }
)

Button.displayName = 'Button'
export default Button
