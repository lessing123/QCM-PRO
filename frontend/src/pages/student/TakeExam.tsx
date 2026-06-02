import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { studentService } from '../../services/studentService'
import { emitTabChange, emitExamQuit, getSocket } from '../../services/socketService'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import CircularTimer from '../../components/common/CircularTimer'
import { Exam, Attempt } from '../../types'
import { resolveMediaUrl } from '../../utils/media'
import toast from 'react-hot-toast'
import { useTheme } from '../../context/ThemeContext'

export default function TakeExam() {
  const { id }      = useParams()
  const navigate    = useNavigate()
  const { anticheatDisabled } = useTheme()

  const [exam, setExam]               = useState<Exam | null>(null)
  const [attempt, setAttempt]         = useState<Attempt | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers]         = useState<Record<string, string | string[]>>({})
  const [timeLeft, setTimeLeft]       = useState(0)
  const [totalTime, setTotalTime]     = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [skipped, setSkipped]         = useState<Set<number>>(new Set())
  const [tabCount, setTabCount]       = useState(0)
  const [isBlocked, setIsBlocked]     = useState(false)

  const timerRef         = useRef<ReturnType<typeof setInterval> | null>(null)
  const saveRef          = useRef<ReturnType<typeof setTimeout> | null>(null)
  const examRef          = useRef<Exam | null>(null)
  const attemptRef       = useRef<Attempt | null>(null)
  const anticheatRef     = useRef(anticheatDisabled)

  useEffect(() => { if (id) load() }, [id])
  useEffect(() => { examRef.current        = exam             }, [exam])
  useEffect(() => { attemptRef.current     = attempt          }, [attempt])
  useEffect(() => { anticheatRef.current   = anticheatDisabled }, [anticheatDisabled])

  // Timer
  useEffect(() => {
    if (!exam || timeLeft <= 0 || isBlocked || isSubmitting) return
    timerRef.current = setInterval(() => {
      setTimeLeft(p => {
        if (p <= 1) { submitExam(true); return 0 }
        return p - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [exam, timeLeft, isBlocked, isSubmitting])

  // Ecoute les evenements de blocage / deblocage via Socket.io
  useEffect(() => {
    const socket = getSocket()
    if (!socket) return

    const onBlocked = ({ attemptId }: { attemptId: string }) => {
      if (attemptRef.current?.id === attemptId || !attemptRef.current) {
        setIsBlocked(true)
        if (timerRef.current) clearInterval(timerRef.current)
      }
    }
    const onUnblocked = ({ attemptId }: { attemptId: string }) => {
      if (attemptRef.current?.id === attemptId || !attemptRef.current) {
        setIsBlocked(false)
      }
    }

    socket.on('attempt:blocked',   onBlocked)
    socket.on('attempt:unblocked', onUnblocked)
    return () => {
      socket.off('attempt:blocked',   onBlocked)
      socket.off('attempt:unblocked', onUnblocked)
    }
  }, [])

  // Anti-triche : changement d'onglet - toast non bloquant
  useEffect(() => {
    const handler = () => {
      if (!document.hidden || !examRef.current) return
      if (anticheatRef.current) return
      const newCount = tabCount + 1
      setTabCount(newCount)
      emitTabChange(examRef.current.id, examRef.current.titre)

      // Toast non bloquant : l'étudiant peut continuer sans scroller
      toast.custom((t) => (
        <div className={`${t.visible ? 'animate-fade-in' : 'opacity-0'} flex items-start gap-3 max-w-sm w-full bg-white dark:bg-slate-800 border border-warning-300 dark:border-warning-700 rounded-2xl shadow-modal px-4 py-3`}>
          <div className="shrink-0 w-8 h-8 bg-warning-100 dark:bg-warning-900/40 rounded-xl flex items-center justify-center">
            <svg className="w-4 h-4 text-warning-600 dark:text-warning-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-warning-800 dark:text-warning-300">
              Alerte - Changement d'onglet
            </p>
            <p className="text-xs text-warning-600 dark:text-warning-400 mt-0.5">
              Incident signalé au professeur ({newCount} fois)
            </p>
          </div>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ), { id: 'tab-warning', duration: 6000, position: 'top-right' })
    }
    document.addEventListener('visibilitychange', handler)
    return () => document.removeEventListener('visibilitychange', handler)
  }, [tabCount])

  // Anti-triche : quitter la page
  useEffect(() => {
    const handler = () => {
      if (anticheatRef.current) return
      if (examRef.current && attemptRef.current)
        emitExamQuit(examRef.current.id, examRef.current.titre)
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [])

  // Anti-triche : clic droit + copier
  useEffect(() => {
    const noCtx  = (e: MouseEvent)     => e.preventDefault()
    const noCopy = (e: ClipboardEvent) => e.preventDefault()
    document.addEventListener('contextmenu', noCtx)
    document.addEventListener('copy', noCopy)
    return () => {
      document.removeEventListener('contextmenu', noCtx)
      document.removeEventListener('copy', noCopy)
    }
  }, [])

  // Chargement de l'examen
  const load = async () => {
    try {
      const { attempt: a, exam: e } = await studentService.startExam(id!)
      setExam(e); setAttempt(a)
      // Si la tentative est déjà bloquée (rechargement de page), afficher l'overlay
      if ((a as any).bloque) setIsBlocked(true)
      const secs = e.duree_minutes * 60
      setTimeLeft(secs); setTotalTime(secs)

      if (a.studentAnswers && e.questions) {
        const prev: Record<string, string | string[]> = {}
        // Grouper les réponses par questionId
        const grouped: Record<string, string[]> = {}
        a.studentAnswers.forEach((sa: any) => {
          if (!sa.answerId) return
          if (!grouped[sa.questionId]) grouped[sa.questionId] = []
          grouped[sa.questionId].push(sa.answerId)
        })
        // Adapter selon le type de question
        e.questions.forEach((q: any) => {
          if (!grouped[q.id]) return
          if (q.type === 'MULTIPLE') {
            prev[q.id] = grouped[q.id]          // array pour multiple
          } else {
            prev[q.id] = grouped[q.id][0] || '' // string pour single
          }
        })
        setAnswers(prev)
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erreur de chargement')
      navigate('/student/dashboard')
    }
  }

  // Sauvegarde automatique
  const saveAnswer = useCallback((questionId: string, answerId?: string, answerIds?: string[]) => {
    if (saveRef.current) clearTimeout(saveRef.current)
    saveRef.current = setTimeout(async () => {
      try {
        await studentService.submitAnswer(attemptRef.current!.id, questionId, answerId, answerIds)
      }
      catch { /* silencieux */ }
    }, 400)
  }, [])

  // Selection unique (SINGLE / TRUE_FALSE)
  const selectAnswer = (questionId: string, answerId: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answerId }))
    saveAnswer(questionId, answerId)
  }

  // Toggle pour choix multiple (MULTIPLE)
  const toggleMultipleAnswer = (questionId: string, answerId: string) => {
    setAnswers(prev => {
      const current = (prev[questionId] as string[] | undefined) ?? []
      const updated = current.includes(answerId)
        ? current.filter(id => id !== answerId)
        : [...current, answerId]
      saveAnswer(questionId, undefined, updated)
      return { ...prev, [questionId]: updated }
    })
  }

  // Navigation
  const goNext = () => {
    const len = exam?.questions?.length ?? 0
    if (currentIndex < len - 1) setCurrentIndex(p => p + 1)
  }
  const goPrev = () => { if (currentIndex > 0) setCurrentIndex(p => p - 1) }
  const skipQuestion = () => {
    setSkipped(prev => new Set([...prev, currentIndex]))
    goNext()
  }

  // Soumission
  const submitExam = async (auto = false) => {
    if (!attemptRef.current) return
    if (timerRef.current) clearInterval(timerRef.current)
    setIsSubmitting(true)
    try {
      const result = await studentService.submitExam(attemptRef.current.id)
      if (!auto) toast.success('Examen soumis avec succès')
      navigate(`/student/recap/${result.attempt.id}`)
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erreur lors de la soumission')
    } finally {
      setIsSubmitting(false)
      setShowConfirm(false)
    }
  }

  const fmt = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

  // Ecran de chargement
  if (!exam?.questions) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-2 border-primary-600 dark:border-primary-400 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-slate-500 dark:text-slate-400">Chargement de l'examen…</p>
      </div>
    </div>
  )

  const questions = exam.questions
  const currentQ   = questions[currentIndex]
  const total      = questions.length
  const answered   = Object.keys(answers).filter(k => {
    const v = answers[k]
    return Array.isArray(v) ? v.length > 0 : !!v
  }).length
  const isAnswered = Array.isArray(answers[currentQ.id])
    ? (answers[currentQ.id] as string[]).length > 0
    : !!answers[currentQ.id]
  const isMultiple = currentQ.type === 'MULTIPLE'
  const isLast     = currentIndex === total - 1
  const isCritical = timeLeft > 0 && timeLeft < 300
  const progress   = Math.round((answered / total) * 100)

  // Overlay de blocage infranchissable
  if (isBlocked) return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/98 backdrop-blur-sm font-sans">
      <div className="mx-4 w-full max-w-lg space-y-6 rounded-[2rem] border border-white/10 bg-slate-900/95 p-6 shadow-modal sm:p-8">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-2 border-danger-500 bg-danger-500/15">
          <svg className="h-12 w-12 text-danger-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>

        <div className="space-y-3 text-center">
          <p className="inline-flex items-center rounded-full border border-danger-500/30 bg-danger-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-danger-200">
            Suspension temporaire
          </p>
          <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">
            Examen suspendu
          </h1>
          <p className="text-balance text-sm leading-7 text-slate-300 sm:text-base">
            Votre examen a été <span className="font-semibold text-danger-300">suspendu</span> à la suite d'un changement d'onglet détecté.
          </p>
        </div>

        <div className="space-y-3 rounded-2xl border border-slate-700 bg-slate-800/80 p-5 text-left text-sm">
          <div className="flex items-start gap-3">
            <svg className="mt-0.5 h-5 w-5 shrink-0 text-warning-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <p className="text-slate-300">
              Cet incident a été <strong className="text-white">signalé à votre professeur</strong>.
              Attendez qu'il débloque votre accès.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <svg className="mt-0.5 h-5 w-5 shrink-0 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
            <p className="text-slate-300">
              Votre progression est <strong className="text-white">conservée</strong>. L'examen reprendra
              exactement là où vous étiez.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <svg className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-slate-400">
              Le minuteur est en pause pendant la suspension.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 text-sm text-slate-500">
          <div className="flex gap-1">
            {[0, 1, 2].map(i => (
              <div key={i} className="h-2 w-2 animate-pulse rounded-full bg-danger-500" style={{ animationDelay: `${i * 0.2}s` }} />
            ))}
          </div>
          <span>En attente du déblocage par votre professeur…</span>
        </div>
      </div>
    </div>
  )

  return (

    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 select-none flex flex-col">

      {/* Modal de confirmation de soumission */}
      <Modal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Soumettre l'examen"
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowConfirm(false)}>
              Annuler
            </Button>
            <Button variant="success" isLoading={isSubmitting} onClick={() => submitExam()}>
              Confirmer
            </Button>
          </div>
        }
      >
        {/* Minuteur + infos - footer sticky garantit les boutons visibles */}
        <div className="flex flex-col items-center gap-4">
          <CircularTimer timeLeft={timeLeft} totalTime={totalTime} size={100} />

          <div className="w-full grid grid-cols-2 gap-3">
            <div className="text-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
              <p className={`text-2xl font-bold ${answered === total ? 'text-success-600 dark:text-success-400' : 'text-warning-600 dark:text-warning-500'}`}>
                {answered}/{total}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Répondues</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
              <p className="text-2xl font-bold text-slate-700 dark:text-slate-200">
                {total - answered}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Restantes</p>
            </div>
          </div>

          {answered < total && (
            <p className="w-full text-xs text-warning-700 dark:text-warning-300 bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 p-3 rounded-xl">
              {total - answered} question(s) sans réponse seront comptées comme incorrectes.
            </p>
          )}
        </div>
      </Modal>

      {/* Header sticky */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between gap-3">

            {/* Titre + progression */}
            <div className="min-w-0 flex-1">
              <h1 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                {exam.titre}
              </h1>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0">
                  Q {currentIndex + 1}/{total}
                </span>
                <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-500 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 shrink-0">
                  {progress}%
                </span>
              </div>
            </div>

            {/* Minuteur circulaire */}
            <div className="shrink-0">
              <CircularTimer timeLeft={timeLeft} totalTime={totalTime} size={68} />
            </div>
          </div>
        </div>
      </header>

      {/* Corps principal */}
      <main className="flex-1 flex items-start justify-center px-4 pt-5 pb-28">
        <div className="w-full max-w-3xl space-y-4">

          {/* Carte question */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-card overflow-hidden">

            {/* En-tete */}
            <div className="px-5 pt-5 pb-4 border-b border-slate-100 dark:border-slate-700/60">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className={`badge ${
                  currentQ.type === 'SINGLE'   ? 'badge-primary' :
                  currentQ.type === 'MULTIPLE' ? 'badge-warning'  :
                                                  'badge-neutral'
                }`}>
                  {currentQ.type === 'SINGLE'   ? 'Choix unique'  :
                   currentQ.type === 'MULTIPLE' ? 'Choix multiple' :
                                                  'Vrai / Faux'}
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  {currentQ.points} point{currentQ.points > 1 ? 's' : ''}
                </span>
                {skipped.has(currentIndex) && <span className="badge badge-warning">Passée</span>}
              </div>
              <p className="text-base font-semibold text-slate-900 dark:text-white leading-relaxed">
                {currentQ.enonce}
              </p>
            </div>

            {/* Indice pour choix multiple */}
            {isMultiple && (
              <div className="px-5 -mt-1 mb-1">
                <p className="text-xs text-primary-600 dark:text-primary-400 font-medium flex items-center gap-1.5">Plusieurs réponses possibles - cochez toutes les bonnes réponses</p>
              </div>
            )}

            {/* Reponses */}
            <div className="p-5 space-y-3">
              {currentQ.answers?.map((answer, ai) => {
                const letter = String.fromCharCode(65 + ai)
                const selected = isMultiple
                  ? ((answers[currentQ.id] as string[] | undefined) ?? []).includes(answer.id)
                  : answers[currentQ.id] === answer.id

                const handleClick = () => isMultiple
                  ? toggleMultipleAnswer(currentQ.id, answer.id)
                  : selectAnswer(currentQ.id, answer.id)

                return (
                  <button
                    key={answer.id}
                    onClick={handleClick}
                    className={[
                      'w-full text-left rounded-xl border-2 transition-all duration-150 flex items-center gap-4',
                      answer.image_url ? 'p-3' : 'p-4',
                      selected
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-400'
                        : 'border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-slate-50 dark:hover:bg-slate-800/50',
                    ].join(' ')}
                  >
                    {/* Indicateur : cercle pour SINGLE, carre pour MULTIPLE */}
                    {isMultiple ? (
                      <div className={`w-5 h-5 rounded-md border-2 shrink-0 flex items-center justify-center transition-colors ${
                        selected
                          ? 'border-primary-500 bg-primary-500 dark:border-primary-400 dark:bg-primary-400'
                          : 'border-slate-300 dark:border-slate-600'
                      }`}>
                        {selected && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        )}
                      </div>
                    ) : (
                      <div className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
                        selected
                          ? 'border-primary-500 bg-primary-500 dark:border-primary-400 dark:bg-primary-400'
                          : 'border-slate-300 dark:border-slate-600'
                      }`}>
                        {selected && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                    )}

                    {/* Lettre + contenu */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className={`text-xs font-bold w-5 text-center shrink-0 ${selected ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 dark:text-slate-500'}`}>
                        {letter}
                      </span>
                      {answer.image_url && (
                        <img src={resolveMediaUrl(answer.image_url)} alt={`Option ${letter}`}
                          className="h-14 w-auto rounded-lg object-contain border border-slate-200 dark:border-slate-700 shrink-0"
                        />
                      )}
                      <span className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                        {answer.texte}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Navigation Precedent / Passer / Suivant */}
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={goPrev} disabled={currentIndex === 0}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              Précédent
            </Button>

            {!isAnswered && !isLast && (
              <Button variant="ghost" size="sm" onClick={skipQuestion} className="text-xs text-slate-400 dark:text-slate-500">
                Passer
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Button>
            )}

            {isLast ? (
              <Button variant="success" onClick={() => setShowConfirm(true)}>
                Terminer
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </Button>
            ) : (
              <Button onClick={goNext}>
                Suivant
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </Button>
            )}
          </div>

          {/* Mini-map */}
          <div className="text-center space-y-2">
            <div className="flex justify-center gap-1.5 flex-wrap">
              {questions.map((q, i) => (
                <div key={q.id} title={`Q${i + 1}`}
                  className={[
                    'h-2 rounded-full transition-all duration-300',
                    i === currentIndex ? 'w-6 bg-primary-500 dark:bg-primary-400' :
                    answers[q.id]      ? 'w-2 bg-success-400 dark:bg-success-500' :
                    skipped.has(i)     ? 'w-2 bg-warning-400 dark:bg-warning-500' :
                                         'w-2 bg-slate-300 dark:bg-slate-600',
                  ].join(' ')}
                />
              ))}
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Répondues : {answered}/{total}
            </p>
          </div>
        </div>
      </main>

      {/* Barre fixe en bas toujours visible */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-t border-slate-200 dark:border-slate-700 px-4 py-3 safe-bottom">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
              isCritical
                ? 'bg-danger-100 text-danger-700 dark:bg-danger-900/30 dark:text-danger-400'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
            }`}>
              {fmt(timeLeft)}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              {answered}/{total} répondues
            </span>
          </div>
          <Button
            variant={isCritical ? 'danger' : 'success'}
            size="sm"
            onClick={() => setShowConfirm(true)}
            isLoading={isSubmitting}
          >
            Soumettre l'examen
          </Button>
        </div>
      </div>
    </div>
  )
}
