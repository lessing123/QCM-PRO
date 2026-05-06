interface CircularTimerProps {
  timeLeft: number
  totalTime: number
  size?: number
}

export default function CircularTimer({ timeLeft, totalTime, size = 80 }: CircularTimerProps) {
  const strokeWidth = 6
  const radius      = (size - strokeWidth * 2) / 2
  const circumference = 2 * Math.PI * radius
  const progress    = totalTime > 0 ? Math.max(0, timeLeft / totalTime) : 0
  const offset      = circumference * (1 - progress)

  const mins = Math.floor(timeLeft / 60)
  const secs = timeLeft % 60
  const label = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`

  // Couleur selon le temps restant
  const isCritical = timeLeft > 0 && timeLeft < 300   // < 5 min  → rouge
  const isWarning  = timeLeft >= 300 && timeLeft < 600 // < 10 min → orange
  const trackColor = isCritical ? '#ef4444' : isWarning ? '#f59e0b' : '#22c55e'

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
      role="timer"
      aria-label={`Temps restant : ${label}`}
    >
      {/* Anneau SVG — pivoté -90° pour démarrer en haut */}
      <svg
        width={size}
        height={size}
        className="-rotate-90"
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        {/* Piste de fond */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-200 dark:text-slate-700"
        />

        {/* Arc animé qui se vide */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 1s linear, stroke 0.6s ease',
            filter: isCritical ? 'drop-shadow(0 0 4px #ef4444)' : 'none',
          }}
        />
      </svg>

      {/* Texte centré */}
      <div className="relative z-10 flex flex-col items-center justify-center leading-none">
        <span
          className={`font-mono font-bold tabular-nums ${
            size >= 72 ? 'text-sm' : 'text-xs'
          } ${
            isCritical ? 'text-danger-600 dark:text-danger-400' :
            isWarning  ? 'text-warning-600 dark:text-warning-500' :
                         'text-slate-700 dark:text-slate-200'
          }`}
        >
          {label}
        </span>
        {size >= 72 && (
          <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5 font-medium uppercase tracking-wide">
            restant
          </span>
        )}
      </div>
    </div>
  )
}
