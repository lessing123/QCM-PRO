import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { examService } from '../../services/examService'
import Card from '../../components/common/Card'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'

const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#22c55e']

export default function Stats() {
  const { examId } = useParams()
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => { if (examId) loadStats() }, [examId])

  const loadStats = async () => {
    try {
      setData(await examService.getStats(examId!))
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) return (
    <div className="space-y-6 animate-pulse">
      <div className="skeleton h-6 w-48 rounded-xl" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="skeleton h-80 rounded-2xl" />
        <div className="skeleton h-80 rounded-2xl" />
      </div>
    </div>
  )

  const questionChartData = (data?.questionStats || []).map((q: any, i: number) => ({
    name: `Q${i + 1}`,
    taux: Math.round(q.successRate),
    label: q.enonce.substring(0, 30) + '…',
  }))

  const scoreDistribution = [
    { name: '0 – 5',   value: 0 },
    { name: '5 – 10',  value: 0 },
    { name: '10 – 15', value: 0 },
    { name: '15 – 20', value: 0 },
  ]

  const tooltipStyle = {
    backgroundColor: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '0.75rem',
    fontSize: '0.8rem',
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <Link
          to="/admin/exams"
          className="inline-flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors mb-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Retour aux examens
        </Link>
        <h1 className="page-title">Statistiques : {data?.exam?.titre}</h1>
        <p className="page-subtitle">{data?.globalStats?.totalAttempts || 0} tentatives analysées</p>
      </div>

      {/* Stats globales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Tentatives', val: data?.globalStats?.totalAttempts || 0, suf: '' },
          { label: 'Moyenne',    val: data?.globalStats?.averageScore?.toFixed(1) || '0', suf: '/20' },
          { label: 'Minimum',   val: data?.globalStats?.minScore || 0, suf: '/20' },
          { label: 'Maximum',   val: data?.globalStats?.maxScore || 0, suf: '/20' },
        ].map(s => (
          <Card key={s.label} className="text-center">
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {s.val}<span className="text-base text-slate-400 dark:text-slate-500">{s.suf}</span>
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Taux de réussite par question">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={questionChartData} margin={{ top: 4, right: 4, left: -20, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(v: unknown) => [`${v}%`, 'Taux de réussite']}
                contentStyle={tooltipStyle}
              />
              <Bar dataKey="taux" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Distribution des scores">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={scoreDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={90}
                dataKey="value"
              >
                {scoreDistribution.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Détail par question */}
      <Card title="Détail par question">
        <div className="space-y-6">
          {(data?.questionStats || []).map((question: any, index: number) => {
            const rate = question.successRate
            const color = rate >= 70 ? 'text-success-600 dark:text-success-400'
              : rate >= 40 ? 'text-warning-600 dark:text-warning-400'
              : 'text-danger-600 dark:text-danger-400'
            const bar = rate >= 70 ? 'bg-success-500' : rate >= 40 ? 'bg-warning-500' : 'bg-danger-500'

            return (
              <div key={question.questionId} className="border-b border-slate-200 dark:border-slate-700/60 pb-5 last:border-0 last:pb-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span className="text-xs font-bold text-slate-400 dark:text-slate-500">Q{index + 1}</span>
                      <span className="badge badge-neutral">{question.type}</span>
                      <span className="text-xs text-slate-400 dark:text-slate-500">{question.points} pt(s)</span>
                    </div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white leading-snug">{question.enonce}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-2xl font-bold ${color}`}>{rate.toFixed(0)}%</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                      {question.correctCount}/{question.totalResponses}
                    </p>
                  </div>
                </div>

                <div className="mt-3 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ${bar}`} style={{ width: `${rate}%` }} />
                </div>

                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                  {question.answers?.map((answer: any) => (
                    <div
                      key={answer.answerId}
                      className={`flex items-center justify-between p-2.5 rounded-xl text-sm border ${
                        answer.est_correcte
                          ? 'bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-800/40'
                          : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700/40'
                      }`}
                    >
                      <span className={`flex items-center gap-1.5 ${answer.est_correcte ? 'font-medium text-success-700 dark:text-success-300' : 'text-slate-600 dark:text-slate-400'}`}>
                        {answer.est_correcte && (
                          <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                          </svg>
                        )}
                        {answer.texte}
                      </span>
                      <span className="ml-2 font-semibold text-slate-500 dark:text-slate-400 shrink-0">
                        {answer.percentage.toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
