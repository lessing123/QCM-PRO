import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Card from '../../components/common/Card'
import { studentService } from '../../services/studentService'
import { resolveMediaUrl } from '../../utils/media'
import { Attempt } from '../../types'
import toast from 'react-hot-toast'

export default function ExamRecap() {
  const { attemptId } = useParams()
  const [attempt, setAttempt] = useState<Attempt | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (attemptId) load()
  }, [attemptId])

  const load = async () => {
    try {
      const data = await studentService.getResult(attemptId!)
      setAttempt(data.attempt)
    } catch {
      toast.error('Erreur de chargement')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-4 animate-pulse">
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
      </div>
    )
  }

  if (!attempt || !attempt.exam) {
    return (
      <div className="mx-auto max-w-3xl">
        <Card>
          <p className="py-8 text-center text-slate-400">Résultat introuvable</p>
        </Card>
      </div>
    )
  }

  const { exam, studentAnswers = [] } = attempt
  const questions = exam.questions || []
  const resultats_publics = exam.resultats_publics

  const getStudentAnswer = (questionId: string) => studentAnswers.find(sa => sa.questionId === questionId)

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="rounded-[2rem] bg-gradient-to-br from-primary-700 via-slate-900 to-slate-950 p-8 text-white shadow-2xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary-200">Examen terminé</p>
            <h1 className="mt-3 font-display text-3xl font-bold">{exam.titre}</h1>
            <p className="mt-3 text-sm text-slate-300">
              {questions.length} question{questions.length > 1 ? 's' : ''} • {attempt.exam.duree_minutes} minutes
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-white/10 px-6 py-4 text-center backdrop-blur">
            {resultats_publics && attempt.score != null ? (
              <>
                <p className="text-4xl font-black">{attempt.score.toFixed(1)}</p>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-300">/20</p>
              </>
            ) : (
              <>
                <IconClock />
                <p className="mt-2 text-sm text-slate-200">Note en attente</p>
              </>
            )}
          </div>
        </div>
      </div>

      {!resultats_publics && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800/40 dark:bg-amber-950/20">
          <IconInfo />
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Note non encore disponible</p>
            <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
              Votre professeur publiera votre note quand il le souhaitera. Voici le récapitulatif de vos réponses.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {questions.map((question, index) => {
          const sa = getStudentAnswer(question.id)
          const answered = !!sa?.answerId
          const isCorrect = resultats_publics ? sa?.est_correcte : undefined

          return (
            <Card key={question.id}>
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {index + 1}
                    </span>
                    <span className={`badge ${question.type === 'SINGLE' ? 'badge-primary' : question.type === 'MULTIPLE' ? 'badge-warning' : 'badge-neutral'}`}>
                      {question.type === 'SINGLE' ? 'Choix unique' : question.type === 'MULTIPLE' ? 'Choix multiple' : 'Vrai / Faux'}
                    </span>
                    <span className="text-xs text-slate-400">{question.points} pt{question.points > 1 ? 's' : ''}</span>
                  </div>
                  {resultats_publics && (
                    <span className={`badge shrink-0 ${isCorrect ? 'badge-success' : !answered ? 'badge-neutral' : 'badge-danger'}`}>
                      {isCorrect ? (
                        <span className="flex items-center gap-1">
                          <IconCheck />
                          Correct
                        </span>
                      ) : !answered ? (
                        'Sans réponse'
                      ) : (
                        <span className="flex items-center gap-1">
                          <IconCross />
                          Incorrect
                        </span>
                      )}
                    </span>
                  )}
                </div>

                <p className="text-sm font-medium leading-relaxed text-slate-800 dark:text-slate-200">{question.enonce}</p>

                <div className="space-y-2">
                  {question.answers?.map(answer => {
                    const isChosen = answer.id === sa?.answerId
                    const isAnswerCorrect = resultats_publics ? answer.est_correcte : false

                    let style = 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/40'
                    if (isChosen && !resultats_publics) {
                      style = 'border-primary-400 bg-primary-50 dark:border-primary-600 dark:bg-primary-900/20'
                    } else if (resultats_publics && isAnswerCorrect) {
                      style = 'border-emerald-400 bg-emerald-50 dark:border-emerald-600 dark:bg-emerald-900/20'
                    } else if (resultats_publics && isChosen && !isAnswerCorrect) {
                      style = 'border-rose-400 bg-rose-50 dark:border-rose-600 dark:bg-rose-900/20'
                    }

                    return (
                      <div key={answer.id} className={`flex items-center gap-3 rounded-xl border-2 px-3 py-2.5 transition-colors ${style}`}>
                        <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${isChosen ? 'border-primary-500 bg-primary-500' : 'border-slate-300 dark:border-slate-600'}`}>
                          {isChosen && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                        </div>
                        {answer.image_url && (
                          <img
                            src={resolveMediaUrl(answer.image_url)}
                            alt="réponse"
                            className="h-12 w-auto rounded-lg border border-slate-200 object-contain dark:border-slate-700"
                          />
                        )}
                        <span className="flex-1 text-sm text-slate-700 dark:text-slate-300">{answer.texte}</span>
                        {resultats_publics && isAnswerCorrect && <IconCheck className="text-emerald-600 dark:text-emerald-400" />}
                        {resultats_publics && isChosen && !isAnswerCorrect && <IconCross className="text-rose-600 dark:text-rose-400" />}
                      </div>
                    )
                  })}
                </div>

                {!answered && <p className="text-xs italic text-slate-400 dark:text-slate-500">Aucune réponse fournie</p>}
              </div>
            </Card>
          )
        })}
      </div>

      <div className="flex justify-center pb-8">
        <Link
          to="/student/history"
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-medium text-slate-700 shadow-card transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          <IconBack />
          Retour à l'historique
        </Link>
      </div>
    </div>
  )
}

function IconBack() {
  return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
}

function IconCheck({ className = 'text-emerald-600 dark:text-emerald-400' }: { className?: string }) {
  return <svg className={`h-3.5 w-3.5 ${className}`} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="m5 10.5 3 3 7-7" /></svg>
}

function IconCross({ className = 'text-rose-600 dark:text-rose-400' }: { className?: string }) {
  return <svg className={`h-3.5 w-3.5 ${className}`} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="m5 5 10 10M15 5 5 15" /></svg>
}

function IconClock() {
  return <svg className="mx-auto h-6 w-6 text-white/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
}

function IconInfo() {
  return <svg className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25h.008v.008h-.008v-.008ZM12 8.25v6M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
}
