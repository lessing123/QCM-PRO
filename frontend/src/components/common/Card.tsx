import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  title?: string
  subtitle?: string
  action?: ReactNode
  noPadding?: boolean
  hover?: boolean
}

export default function Card({ children, className = '', title, subtitle, action, noPadding, hover }: CardProps) {
  return (
    <div
      className={[
        'rounded-2xl border bg-slate-100/85 backdrop-blur-sm',
        'border-slate-300/70 shadow-card',
        'dark:bg-slate-900 dark:border-slate-700/60',
        hover ? 'transition-shadow duration-200 hover:shadow-card-hover cursor-pointer' : '',
        className,
      ].join(' ')}
    > {(title || action) && (
        <div className="flex items-start justify-between px-6 py-4 border-b border-slate-300/60 dark:border-slate-700/60"> <div> {title && (
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h3> )}
            {subtitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p> )}
          </div> {action && <div className="ml-4 shrink-0">{action}</div>}
        </div> )}
      <div className={noPadding ? '' : 'p-6'}>{children}</div> </div> )
}
