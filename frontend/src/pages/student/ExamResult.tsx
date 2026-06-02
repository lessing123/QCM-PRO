import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Card from '../../components/common/Card'
import { studentService } from '../../services/studentService'
import { resolveMediaUrl } from '../../utils/media'
import { Attempt } from '../../types'

type Summary = {
  correctAnswers?: number
  totalQuestions?: number
}

export default function ExamResult() {
  const { attemptId } = useParams()
  const [attempt, setAttempt] = useState<Attempt | null>(null)
  const [summary, setSummary] = useState<Summary | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (attemptId) loadResult()
  }, [attemptId])

  const loadResult = async () => {
    try {
      const data = await studentService.getResult(attemptId!)
      setAttempt(data.attempt)
      setSummary(data.summary)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="h-5 w-40 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700" />
        <div className="h-72 animate-pulse rounded-[2rem] bg-slate-200 dark:bg-slate-800" />
        <div className="h-96 animate-pulse rounded-[2rem] bg-slate-200 dark:bg-slate-800" />
      </div>
    )
  }

  if (!attempt) {
    return (
      <div className="mx-auto max-w-3xl">
        <Card>
          <div className="py-12 text-center">
            <IconDocument />
            <p className="mt-3 text-slate-500 dark:text-slate-400">Résultat introuvable</p>
          </div>
        </Card>
      </div>
    )
  }

  const passed = (attempt.score || 0) >= 10
  const scorePercent = Math.round(((attempt.score || 0) / 20) * 100)
  const resultats_publics = attempt.exam?.resultats_publics ?? false

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link
          to="/student/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 transition-colors hover:text-primary-700 dark:text-primary-400"
        >
          <IconBack />
          Retour aux examens
        </Link>
      </div>

      <Card>
        <div className="rounded-[1.75rem] bg-gradient-to-br from-slate-950 via-slate-900 to-primary-900 p-8 text-white">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary-200">Résultat final</p>
              <h1 className="mt-3 font-display text-3xl font-bold leading-tight">{attempt.exam?.titre}</h1>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                {summary?.correctAnswers ?? 0}/{summary?.totalQuestions ?? 0} bonnes réponses, examen passé le{' '}
                {new Date(attempt.date_fin || attempt.date_debut).toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>

            <div className="flex items-center gap-4">
              {resultats_publics ? (
                <>
                  <div className={`rounded-[1.5rem] border px-5 py-4 ${passed ? 'border-emerald-400/40 bg-emerald-400/10' : 'border-rose-400/40 bg-rose-400/10'}`}>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-300">Statut</p>
                    <div className="mt-2 flex items-center gap-2 text-sm font-semibold">
                      {passed ? <IconCheck /> : <IconCross />}
                      {passed ? 'Réussi' : 'Non réussi'}
                    </div>
                  </div>
                  <div className="rounded-[1.5rem] bg-white/10 px-6 py-4 text-center backdrop-blur">
                    <p className="text-4xl font-black">{attempt.score?.toFixed(1)}</p>
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-300">/20</p>
                  </div>
                </>
              ) : (
                <div className="rounded-[1.5rem] border border-amber-400/30 bg-amber-400/10 px-6 py-4 text-center">
                  <p className="text-sm font-semibold text-amber-200">Note en attente</p>
                  <p className="mt-1 text-xs text-amber-300/70">En attente de publication</p>
                </div>
              )}
            </div>
          </div>

          {resultats_publics && (
            <div className="mt-8 max-w-md">
              <div className="h-3 overflow-hidden rounded-full bg-white/15">
                <div
                  className={`h-full rounded-full ${passed ? 'bg-emerald-400' : 'bg-rose-400'}`}
                  style={{ width: `${scorePercent}%` }}
                />
              </div>
              <p className="mt-3 text-sm text-slate-300">
                {passed
                  ? 'Félicitations, la performance est au niveau attendu.'
                  : 'Le travail est visible, mais quelques points restent à consolider.'}
              </p>
            </div>
          )}
        </div>
      </Card>

      <Card title="Récapitulatif de vos réponses">
        <div className="space-y-5">
          {attempt.exam?.questions?.map((question, index) => {
            const studentAnswer = attempt.studentAnswers?.find(sa => sa.questionId === question.id)
            const isCorrect = studentAnswer?.est_correcte

            return (
              <div key={question.id} className="border-b border-slate-200 pb-5 last:border-0 last:pb-0 dark:border-slate-700/60">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Q{index + 1}</span>
                      <span className="badge badge-primary">{question.type}</span>
                      <span className="text-xs text-slate-400">{question.points} point(s)</span>
                    </div>
                    <p className="mt-2 leading-relaxed text-slate-900 dark:text-slate-100">{question.enonce}</p>
                  </div>
                  {resultats_publics && (
                    <div className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
                      isCorrect
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-900/20 dark:text-emerald-300'
                        : 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800/40 dark:bg-rose-900/20 dark:text-rose-300'
                    }`}>
                      {isCorrect ? <IconCheck /> : <IconCross />}
                      {isCorrect ? 'Correct' : 'Incorrect'}
                    </div>
                  )}
                </div>

                <div className="mt-3 space-y-2">
                  {studentAnswer?.answer ? (
                    <div className={`rounded-2xl border p-3 text-sm ${
                      !resultats_publics
                        ? 'border-primary-200 bg-primary-50 dark:border-primary-800/40 dark:bg-primary-900/15'
                        : isCorrect
                          ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800/40 dark:bg-emerald-900/15'
                          : 'border-rose-200 bg-rose-50 dark:border-rose-800/40 dark:bg-rose-900/15'
                    }`}>
                      <span className={`font-semibold ${
                        !resultats_publics ? 'text-primary-700 dark:text-primary-300'
                          : isCorrect ? 'text-emerald-700 dark:text-emerald-300'
                          : 'text-rose-700 dark:text-rose-300'
                      }`}>Votre réponse :</span>{' '}
                      <span className={
                        !resultats_publics ? 'text-primary-800 dark:text-primary-200'
                          : isCorrect ? 'text-emerald-700 dark:text-emerald-200'
                          : 'text-rose-700 dark:text-rose-200'
                      }>{studentAnswer.answer.texte}</span>
                    </div>
                  ) : (
                    <p className="text-xs italic text-slate-400 dark:text-slate-500">Aucune réponse fournie</p>
                  )}

                  {resultats_publics && !isCorrect && question.answers?.filter(a => a.est_correcte).map(correct => (
                    <div key={correct.id} className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm dark:border-emerald-800/40 dark:bg-emerald-900/15">
                      <span className="font-semibold text-emerald-700 dark:text-emerald-300">Bonne réponse :</span>{' '}
                      <span className="text-emerald-700 dark:text-emerald-200">{correct.texte}</span>
                    </div>
                  ))}

                  {question.answers?.some(a => a.image_url) && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {question.answers.filter(a => a.image_url).map(answer => (
                        <img key={answer.id} src={resolveMediaUrl(answer.image_url)} alt=""
                          className="h-14 w-auto rounded-xl border border-slate-200 object-contain dark:border-slate-700" />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}

function IconBack() {
  return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
}

function IconCheck() {
  return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" /></svg>
}

function IconCross() {
  return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="m6 18 12-12M6 6l12 12" /></svg>
}

function IconDocument() {
  return <svg className="mx-auto h-12 w-12 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 21h-15A1.5 1.5 0 0 1 3 19.5v-15A1.5 1.5 0 0 1 4.5 3H15l6 6v10.5A1.5 1.5 0 0 1 19.5 21ZM15 3v6h6" /></svg>
}
