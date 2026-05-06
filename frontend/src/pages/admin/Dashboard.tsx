import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { examService } from '../../services/examService'
import Card from '../../components/common/Card'
import { AdminStats } from '../../types'

const statCards = [
  { key: 'examCount' as const, label: 'Examens', icon: <IconDocument />, tone: 'text-primary-700 bg-primary-50 border-primary-100 dark:text-primary-300 dark:bg-primary-500/10 dark:border-primary-500/20' },
  { key: 'studentCount' as const, label: 'Étudiants', icon: <IconUsers />, tone: 'text-emerald-700 bg-emerald-50 border-emerald-100 dark:text-emerald-300 dark:bg-emerald-500/10 dark:border-emerald-500/20' },
  { key: 'attemptCount' as const, label: 'Tentatives', icon: <IconPulse />, tone: 'text-amber-700 bg-amber-50 border-amber-100 dark:text-amber-300 dark:bg-amber-500/10 dark:border-amber-500/20' },
  { key: 'avgScore' as const, label: 'Score moyen', icon: <IconChart />, tone: 'text-rose-700 bg-rose-50 border-rose-100 dark:text-rose-300 dark:bg-rose-500/10 dark:border-rose-500/20', suffix: '/20' },
]

export default function Dashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => { loadStats() }, [])

  const loadStats = async () => {
    try {
      const data = await examService.getAdminStats()
      setStats(data)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="skeleton h-44 rounded-[2rem]" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-72 rounded-2xl" />)}
        </div>
      </div>
    )
  }

  const topClasses = [...(stats?.classAverages || [])].sort((a, b) => b.averageScore - a.averageScore).slice(0, 5)

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <div className="absolute inset-y-0 left-0 w-2 bg-gradient-to-b from-primary-700 via-sky-600 to-emerald-500" />
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div className="pl-3">
            <p className="inline-flex items-center rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-primary-700 dark:border-primary-500/20 dark:bg-primary-500/10 dark:text-primary-300">
              Pilotage de la plateforme
            </p>
            <h1 className="mt-4 font-display text-3xl font-bold leading-tight text-slate-900 dark:text-white sm:text-4xl">
              Une vue simple sur les examens, les classes et les performances.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-400">
              Ce tableau de bord rassemble les indicateurs essentiels dans une mise en page sobre, inspirée des interfaces institutionnelles: claire, stable et facile à lire.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Link to="/admin/exams/new" className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-colors hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Action rapide</p>
              <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">Créer un examen</p>
            </Link>
            <Link to="/admin/classes" className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-colors hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Organisation</p>
              <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">Gérer les classes</p>
            </Link>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map(card => (
          <Card key={card.key} className="border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${card.tone}`}>
                {card.icon}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{card.label}</p>
                <p className="mt-0.5 text-2xl font-bold text-slate-900 dark:text-white">
                  {(stats?.[card.key] as number) ?? 0}{card.suffix ?? ''}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card title="Moyenne par classe" className="xl:col-span-1">
          {topClasses.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400 dark:text-slate-500">Aucune classe renseignée</p>
          ) : (
            <div className="space-y-4">
              {topClasses.map(classItem => (
                <div key={classItem.id} className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{classItem.nom}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{classItem.students} étudiant{classItem.students > 1 ? 's' : ''}</p>
                    </div>
                    <span className="text-sm font-bold text-primary-700 dark:text-primary-300">{classItem.averageScore.toFixed(1)}/20</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary-700 to-sky-500"
                      style={{ width: `${Math.min(100, (classItem.averageScore / 20) * 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-slate-400">
                    <span>{classItem.attempts} tentatives</span>
                    <span>{classItem.exams} examen{classItem.exams > 1 ? 's' : ''}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Examens récents" action={<Link to="/admin/exams" className="text-xs font-medium text-primary-700 hover:underline dark:text-primary-300">Voir tout</Link>} className="xl:col-span-1">
          <div className="space-y-1">
            {!stats?.recentExams?.length ? (
              <p className="py-8 text-center text-sm text-slate-400 dark:text-slate-500">Aucun examen créé</p>
            ) : stats.recentExams.map(exam => (
              <Link
                key={exam.id}
                to={`/admin/results/${exam.id}`}
                className="flex items-center justify-between rounded-2xl px-3 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{exam.titre}</p>
                  <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                    {new Date(exam.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <span className="badge badge-neutral">{exam._count?.attempts ?? 0} tentatives</span>
              </Link>
            ))}
          </div>
        </Card>

        <Card title="Dernières tentatives" action={<Link to="/admin/exams" className="text-xs font-medium text-primary-700 hover:underline dark:text-primary-300">Voir tout</Link>} className="xl:col-span-1">
          <div className="space-y-1">
            {!stats?.recentAttempts?.length ? (
              <p className="py-8 text-center text-sm text-slate-400 dark:text-slate-500">Aucune tentative</p>
            ) : stats.recentAttempts.map(attempt => {
              const score = attempt.score ?? 0
              const passed = score >= 10
              return (
                <div key={attempt.id} className="flex items-center justify-between rounded-2xl px-3 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                      {attempt.user?.prenom} {attempt.user?.nom}
                    </p>
                    <p className="truncate text-xs text-slate-400 dark:text-slate-500">{attempt.exam?.titre}</p>
                  </div>
                  <span className={`badge ${passed ? 'badge-success' : 'badge-danger'}`}>
                    {score.toFixed(1)}/20
                  </span>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      <Card title="Actions rapides">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { to: '/admin/exams/new', label: 'Nouvel examen', icon: <IconDocumentPlus /> },
            { to: '/admin/students', label: 'Ajouter étudiant', icon: <IconUserPlus /> },
            { to: '/admin/classes', label: 'Créer une classe', icon: <IconGroupPlus /> },
            { to: '/admin/exams', label: 'Tous les examens', icon: <IconList /> },
          ].map(action => (
            <Link
              key={action.to}
              to={action.to}
              className="group flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition-colors hover:border-primary-200 hover:bg-primary-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-primary-500/30 dark:hover:bg-slate-800"
            >
              <span className="text-slate-400 transition-colors group-hover:text-primary-700 dark:group-hover:text-primary-300">
                {action.icon}
              </span>
              <span className="text-center text-xs font-semibold text-slate-600 group-hover:text-primary-800 dark:text-slate-400 dark:group-hover:text-primary-300">
                {action.label}
              </span>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  )
}

function IconDocument() {
  return <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 21H4.5A1.5 1.5 0 013 19.5v-15A1.5 1.5 0 014.5 3h10.5L21 9v10.5A1.5 1.5 0 0119.5 21zM14 3v6h6" /></svg>
}

function IconUsers() {
  return <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 19.5a7.5 7.5 0 0115 0" /></svg>
}

function IconPulse() {
  return <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12h4l2-5 4 10 2-5h6" /></svg>
}

function IconChart() {
  return <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M4 19h16M7 17V9m5 8V5m5 12v-7" /></svg>
}

function IconDocumentPlus() {
  return <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-3.75L15 6H8.25A2.25 2.25 0 006 8.25v7.5A2.25 2.25 0 008.25 18H12m0-8.25v6m-3-3h6" /></svg>
}

function IconUserPlus() {
  return <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M18 9h3m-1.5-1.5V10.5M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 19.5a7.5 7.5 0 0115 0" /></svg>
}

function IconGroupPlus() {
  return <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 5.25v4.5m2.25-2.25h-4.5" /></svg>
}

function IconList() {
  return <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75v-.008zm0 5.25h.007v.008H3.75V12zm0 5.25h.007v.008H3.75v-.008z" /></svg>
}
