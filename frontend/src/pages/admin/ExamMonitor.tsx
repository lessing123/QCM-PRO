import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { examService } from '../../services/examService'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import toast from 'react-hot-toast'

interface StudentLive {
  id: string; nom: string; prenom: string; email: string
  is_online: boolean; attempt_status: string | null; bloque: boolean
}
interface GroupLive {
  id: string; nom: string; total: number
  connected: number; in_exam: number; finished: number
  students: StudentLive[]
}
interface LiveData {
  exam: { id: string; titre: string }
  groups: GroupLive[]
}

const STATUS_LABEL: Record<string, string> = {
  EN_COURS: 'En cours',
  TERMINE: 'Terminé',
}

export default function ExamMonitor() {
  const { examId } = useParams()
  const [data, setData] = useState<LiveData | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const load = async () => {
    try {
      const d = await examService.getExamLive(examId!)
      setData(d)
      setLastRefresh(new Date())
    } catch {
      toast.error('Erreur de chargement')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!examId) return
    load()
    intervalRef.current = setInterval(load, 5000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [examId])

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[300px]">
      <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!data) return null

  const chartData = data.groups.map(g => ({
    name: g.nom.length > 12 ? g.nom.slice(0, 12) + '…' : g.nom,
    Total: g.total,
    Connectés: g.connected,
    'En cours': g.in_exam,
    Terminés: g.finished,
  }))

  const totalStudents = data.groups.reduce((s, g) => s + g.total, 0)
  const totalConnected = data.groups.reduce((s, g) => s + g.connected, 0)
  const totalInExam = data.groups.reduce((s, g) => s + g.in_exam, 0)
  const totalFinished = data.groups.reduce((s, g) => s + g.finished, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <Link to="/admin/exams" className="inline-flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400 hover:underline mb-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
            Retour aux examens
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{data.exam.titre}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="flex h-2 w-2 rounded-full bg-success-500 animate-pulse" />
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Mise à jour automatique toutes les 5s
              {lastRefresh && ` — ${lastRefresh.toLocaleTimeString('fr-FR')}`}
            </span>
          </div>
        </div>
        <button onClick={load} className="flex items-center gap-2 text-sm font-medium text-primary-600 dark:text-primary-400 border border-primary-300 dark:border-primary-700 rounded-xl px-3 py-2 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
          Actualiser
        </button>
      </div>

      {/* Stats globales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Inscrits', value: totalStudents, color: 'text-slate-700 dark:text-slate-200', bg: 'bg-slate-100 dark:bg-slate-800' },
          { label: 'Connectés', value: totalConnected, color: 'text-primary-700 dark:text-primary-300', bg: 'bg-primary-50 dark:bg-primary-900/20' },
          { label: 'En cours', value: totalInExam, color: 'text-warning-700 dark:text-warning-300', bg: 'bg-warning-50 dark:bg-warning-900/20' },
          { label: 'Terminés', value: totalFinished, color: 'text-success-700 dark:text-success-300', bg: 'bg-success-50 dark:bg-success-900/20' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4 text-center`}>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Graphique par classe */}
      {chartData.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Connexions par classe</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="Total" fill="#cbd5e1" radius={[4,4,0,0]} />
              <Bar dataKey="Connectés" fill="#6366f1" radius={[4,4,0,0]} />
              <Bar dataKey="En cours" fill="#f59e0b" radius={[4,4,0,0]} />
              <Bar dataKey="Terminés" fill="#22c55e" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Détail par classe */}
      <div className="space-y-4">
        {data.groups.map(group => (
          <div key={group.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-5 py-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">{group.nom}</h3>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-slate-500 dark:text-slate-400">{group.total} inscrits</span>
                <span className="font-medium text-primary-600 dark:text-primary-400">{group.connected} connectés</span>
                <span className="font-medium text-warning-600 dark:text-warning-400">{group.in_exam} en cours</span>
                <span className="font-medium text-success-600 dark:text-success-400">{group.finished} terminés</span>
              </div>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {group.students.length === 0 ? (
                <p className="px-5 py-4 text-sm text-slate-400 dark:text-slate-500">Aucun étudiant dans cette classe</p>
              ) : group.students.map(s => (
                <div key={s.id} className="flex items-center justify-between gap-3 px-5 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className={`h-2 w-2 rounded-full shrink-0 ${s.is_online ? 'bg-success-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                    <span className="text-sm text-slate-800 dark:text-slate-200">{s.prenom} {s.nom}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {s.bloque && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-danger-100 text-danger-700 dark:bg-danger-900/30 dark:text-danger-400">Bloqué</span>}
                    {s.attempt_status ? (
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        s.attempt_status === 'EN_COURS'
                          ? 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400'
                          : 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400'
                      }`}>{STATUS_LABEL[s.attempt_status] ?? s.attempt_status}</span>
                    ) : (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                        {s.is_online ? 'Connecté' : 'Absent'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
