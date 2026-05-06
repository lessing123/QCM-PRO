import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { studentService } from '../../services/studentService'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

interface ExamWithStatus {
  id: string
  titre: string
  description?: string
  duree_minutes: number
  tentatives_max: number
  attemptsCount: number
  canTake: boolean
  currentAttemptId: string | null
  _count?: { questions: number }
}

export default function StudentDashboard() {
  const [exams, setExams] = useState<ExamWithStatus[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => { load() }, [])

  const load = async () => {
    try {
      const { exams } = await studentService.getAvailableExams()
      setExams(exams as unknown as ExamWithStatus[])
    } catch { toast.error('Erreur de chargement') }
    finally { setIsLoading(false) }
  }

  const available = exams.filter(e => e.canTake)
  const done = exams.filter(e => !e.canTake)

  if (isLoading) return (
    <div className="space-y-6 animate-pulse"> <div className="skeleton h-28 rounded-2xl" /> <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"> {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-56 rounded-2xl" />)}
      </div> </div> )

  return (
    <div className="space-y-8"> {/* Welcome */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-success-600 via-success-500 to-emerald-400 p-6 text-white shadow-lg"> <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full" /> <div className="absolute bottom-0 -left-6 w-32 h-32 bg-success-700/30 rounded-full" /> <div className="relative flex items-center justify-between"> <div> <h1 className="text-xl font-bold">Bonjour, {user?.prenom} 👋</h1> <p className="text-success-100 text-sm mt-1"> {available.length > 0
                ? `${available.length} examen${available.length > 1 ? 's' : ''} disponible${available.length > 1 ? 's' : ''}`
                : 'Aucun examen disponible pour le moment'}
            </p> </div> <Link to="/student/history" className="shrink-0"> <button className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl text-sm font-medium transition-all"> <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> Historique
            </button> </Link> </div> </div> {available.length > 0 && (
        <section> <h2 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4"> Disponibles maintenant
          </h2> <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"> {available.map(exam => <ExamCard key={exam.id} exam={exam} />)}
          </div> </section> )}

      {done.length > 0 && (
        <section> <h2 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4"> Terminés
          </h2> <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"> {done.map(exam => <ExamCard key={exam.id} exam={exam} />)}
          </div> </section> )}

      {exams.length === 0 && (
        <Card> <div className="text-center py-16"> <div className="mx-auto w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4"> <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg> </div> <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">Aucun examen disponible</h3> <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Votre professeur n'a pas encore publié d'examen.</p> </div> </Card> )}
    </div> )
}

function ExamCard({ exam }: { exam: ExamWithStatus }) {
  const isResumable = !!exam.currentAttemptId
  const isDone = !exam.canTake

  return (
    <div className={[
      'flex flex-col rounded-2xl border p-5 gap-4 transition-all duration-200',
      'bg-white dark:bg-slate-900',
      isDone
        ? 'border-slate-200 dark:border-slate-700/60 opacity-70'
        : 'border-slate-200 dark:border-slate-700/60 hover:shadow-card-hover hover:border-success-300 dark:hover:border-success-600',
    ].join(' ')}> <div className="flex items-start justify-between gap-2"> <h3 className="text-sm font-semibold text-slate-900 dark:text-white leading-snug flex-1">{exam.titre}</h3> <span className={`badge shrink-0 ${isDone ? 'badge-neutral' : isResumable ? 'badge-warning' : 'badge-success'}`}> {isDone ? 'Terminé' : isResumable ? 'En cours' : 'Disponible'}
        </span> </div> {exam.description && (
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 -mt-2">{exam.description}</p> )}

      <div className="grid grid-cols-3 gap-2 text-center"> {[
          { label: 'Durée', value: `${exam.duree_minutes}m` },
          { label: 'Questions', value: exam._count?.questions ?? '—' },
          { label: 'Tentatives', value: `${exam.attemptsCount}/${exam.tentatives_max}` },
        ].map(m => (
          <div key={m.label} className="rounded-xl bg-slate-50 dark:bg-slate-800 py-2 px-1"> <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{m.value}</p> <p className="text-xs text-slate-400 dark:text-slate-500">{m.label}</p> </div> ))}
      </div> {!isDone ? (
        <Link to={isResumable ? `/student/exams/${exam.id}/take` : `/student/exams/${exam.id}`}> <Button variant="success" className="w-full" size="sm"> {isResumable ? 'Reprendre' : 'Commencer'}
          </Button> </Link> ) : (
        <div className="py-2 text-center text-xs font-medium text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 rounded-xl"> Nombre de tentatives atteint
        </div> )}
    </div> )
}
