import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { studentService } from '../../services/studentService'
import Card from '../../components/common/Card'
import { Attempt } from '../../types'

export default function History() {
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadAttempts()
  }, [])

  const loadAttempts = async () => {
    try {
      const { attempts: data } = await studentService.getMyAttempts()
      setAttempts(data)
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6"> <div className="space-y-2"> <div className="h-8 w-36 animate-pulse bg-slate-200 dark:bg-slate-700 rounded-xl"></div> <div className="h-4 w-48 animate-pulse bg-slate-200 dark:bg-slate-700 rounded-xl"></div> </div> <div className="space-y-3"> {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse bg-slate-200 dark:bg-slate-700 rounded-2xl h-24"></div> ))}
        </div> </div> )
  }

  return (
    <div className="space-y-6"> <div> <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Historique</h1> <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5"> {attempts.length > 0
            ? `${attempts.length} examen${attempts.length > 1 ? 's' : ''} passé${attempts.length > 1 ? 's' : ''}`
            : 'Vos examens passés apparaîtront ici'
          }
        </p> </div> {attempts.length === 0 ? (
        <Card> <div className="text-center py-14"> <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 mb-4"> <svg className="h-7 w-7 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /> </svg> </div> <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Aucun historique</h3> <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Vous n'avez pas encore passé d'examens</p> <Link to="/student/dashboard" className="mt-4 inline-block text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors"> Voir les examens disponibles <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
            </Link> </div> </Card> ) : (
        <div className="space-y-3"> {attempts.map((attempt) => {
            const isFinished       = attempt.statut === 'TERMINE'
            const resultatsPublics = (attempt.exam as any)?.resultats_publics ?? false
            const passed           = isFinished && resultatsPublics && (attempt.score || 0) >= 10

            return (
              <div
                key={attempt.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 rounded-2xl px-5 py-4 hover:shadow-md dark:hover:shadow-slate-900/50 transition-all duration-200"
              > <div className="flex items-center justify-between gap-4"> <div className="flex-1 min-w-0"> <div className="flex items-center gap-2.5 flex-wrap"> <h3 className="text-base font-semibold text-slate-900 dark:text-white truncate"> {attempt.exam?.titre}
                      </h3> <span className={`flex-shrink-0 px-2 py-0.5 text-xs font-semibold rounded-full ${
                        !isFinished
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300'
                          : passed
                          ? 'bg-success-100 text-success-700 dark:bg-success-900/40 dark:text-success-300'
                          : 'bg-danger-100 text-danger-700 dark:bg-danger-900/40 dark:text-danger-300'
                      }`}> {!isFinished ? 'En cours' : !resultatsPublics ? 'Terminé' : passed ? 'Réussi' : 'Non réussi'}
                      </span> </div> <div className="mt-1.5 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400"> <span className="flex items-center gap-1"> <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /> </svg> {new Date(attempt.date_debut).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span> <span className="flex items-center gap-1"> <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /> </svg> {attempt.exam?.duree_minutes} min
                      </span> </div> </div> <div className="flex items-center gap-4 flex-shrink-0"> {isFinished ? (
                      <>
                        {resultatsPublics ? (
                          <div className="text-right hidden sm:block"> <p className={`text-2xl font-bold tracking-tight ${
                              passed ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'
                            }`}> {attempt.score?.toFixed(1)}
                              <span className="text-sm text-slate-400 dark:text-slate-500">/20</span> </p> <div className="mt-1 w-16 h-1 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden ml-auto"> <div
                                className={`h-full rounded-full ${passed ? 'bg-success-500' : 'bg-danger-500'}`}
                                style={{ width: `${((attempt.score || 0) / 20) * 100}%` }}
                              /> </div> </div>
                        ) : (
                          <span className="hidden sm:block text-xs text-slate-400 dark:text-slate-500 italic">Note en attente</span>
                        )}
                        <Link
                          to={`/student/results/${attempt.id}`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        > Détails
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /> </svg> </Link> </> ) : (
                      <Link
                        to={`/student/exams/${attempt.exam?.id}/take`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold bg-yellow-500 dark:bg-yellow-600 text-white rounded-xl hover:bg-yellow-600 dark:hover:bg-yellow-700 transition-colors"
                      > <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> </svg> Reprendre
                      </Link> )}
                  </div> </div> </div> )
          })}
        </div> )}
    </div> )
}
