import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { studentService } from '../../services/studentService'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import toast from 'react-hot-toast'
import { Exam } from '../../types'

const CONSIGNES = [
  {
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    text: (duree: number) => `Vous disposez de <strong>${duree} minutes</strong> pour compléter l'examen.`,
  },
  {
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" />
      </svg>
    ),
    text: () => "Une fois démarré, vous ne pouvez pas mettre l'examen en pause.",
  },
  {
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
      </svg>
    ),
    text: () => 'Vos réponses sont <strong>sauvegardées automatiquement</strong> en temps réel.',
  },
  {
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
      </svg>
    ),
    text: () => 'Naviguez librement entre les questions grâce aux boutons et aux points en bas de l\'écran.',
  },
  {
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    text: () => "À la fin du temps imparti, l'examen est soumis <strong>automatiquement</strong>.",
  },
]

const ANTICHEAT = [
  {
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
      </svg>
    ),
    text: () => 'Les <strong>boutons de navigation du navigateur</strong> (← →) sont désactivés. Toute tentative de navigation sera signalée et votre examen sera <strong>suspendu immédiatement</strong>.',
  },
  {
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
      </svg>
    ),
    text: () => 'Changer d\'onglet, ouvrir une autre fenêtre ou basculer vers une autre application est <strong>détecté et signalé</strong> à l\'administrateur. Votre examen sera suspendu.',
  },
  {
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0H3" />
      </svg>
    ),
    text: () => 'Le <strong>partage d\'écran</strong> est interdit et bloqué automatiquement pendant l\'examen.',
  },
  {
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
      </svg>
    ),
    text: () => 'Un seul appareil peut être connecté à votre compte à la fois. Toute <strong>connexion depuis un autre appareil</strong> vous déconnectera automatiquement.',
  },
  {
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
    text: () => 'En cas de suspension, votre examen est <strong>gelé</strong> et le chronomètre s\'arrête. Seul l\'administrateur peut vous débloquer.',
  },
]

export default function ExamInstructions() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [exam, setExam]       = useState<Exam | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isStarting, setIsStarting] = useState(false)
  const [codeInput, setCodeInput] = useState('')
  const [codeError, setCodeError] = useState('')
  const [codeStep, setCodeStep] = useState(false)

  useEffect(() => { if (id) load() }, [id])

  const load = async () => {
    try {
      const { exam: data } = await studentService.getExamDetails(id!)
      setExam(data)
    } catch {
      toast.error('Erreur lors du chargement')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStart = async () => {
    if ((exam as any).requires_code && !codeStep) {
      setCodeStep(true)
      return
    }
    setIsStarting(true)
    setCodeError('')
    try {
      await studentService.startExam(id!, codeInput || undefined)
      navigate(`/student/exams/${id}/take`)
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Erreur'
      if (err.response?.status === 403 && msg.includes('code')) {
        setCodeError('Code incorrect. Vérifiez avec votre professeur.')
      } else {
        toast.error(msg)
      }
    } finally {
      setIsStarting(false)
    }
  }

  if (isLoading) return (
    <div className="max-w-2xl mx-auto space-y-4 animate-pulse">
      <div className="skeleton h-5 w-36 rounded-xl" />
      <div className="skeleton h-32 rounded-2xl" />
      <div className="skeleton h-56 rounded-2xl" />
      <div className="skeleton h-48 rounded-2xl" />
    </div>
  )

  if (!exam) return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <div className="text-center py-12">
          <p className="text-slate-500 dark:text-slate-400">Examen non trouvé</p>
          <Link to="/student/dashboard" className="mt-4 inline-block text-sm text-primary-600 dark:text-primary-400 hover:underline">
            Retour aux examens
          </Link>
        </div>
      </Card>
    </div>
  )

  const attemptsRemaining = exam.tentatives_max - (exam.attemptsCount || 0)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Retour */}
      <Link
        to="/student/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Retour aux examens
      </Link>

      {/* En-tête */}
      <Card>
        <div className="text-center py-4">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-100 dark:bg-primary-900/40 mb-4">
            <svg className="w-7 h-7 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{exam.titre}</h1>
          {exam.description && (
            <p className="mt-2 text-slate-500 dark:text-slate-400 max-w-md mx-auto">{exam.description}</p>
          )}
        </div>
      </Card>

      {/* Informations */}
      <Card title="Informations de l'examen">
        <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
          {[
            { label: 'Durée', value: `${exam.duree_minutes} minutes`, icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
            { label: 'Questions', value: `${exam._count?.questions || 0}`, icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
            { label: 'Tentatives', value: `${exam.attemptsCount || 0} / ${exam.tentatives_max}`, icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg> },
            { label: 'Ordre', value: exam.melange_questions ? 'Aléatoire' : 'Fixe', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5" /></svg> },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-400">
                {item.icon}
                <span className="text-sm">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-900 dark:text-white">{item.value}</span>
                {item.label === 'Tentatives' && attemptsRemaining > 0 && (
                  <span className="badge badge-success">
                    {attemptsRemaining} restante{attemptsRemaining > 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Consignes */}
      <Card title="Consignes importantes">
        <div className="space-y-3">
          {CONSIGNES.map(({ icon, text }, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
              <span className="shrink-0 mt-0.5 text-slate-500 dark:text-slate-400">{icon}</span>
              <p
                className="text-sm leading-relaxed text-slate-600 dark:text-slate-400"
                dangerouslySetInnerHTML={{ __html: text(exam.duree_minutes) }}
              />
            </div>
          ))}
        </div>
      </Card>

      {/* Règles anti-triche */}
      <div className="rounded-2xl border border-danger-200 dark:border-danger-800/50 bg-danger-50 dark:bg-danger-950/30 overflow-hidden">
        <div className="flex items-center gap-2.5 px-4 py-3 bg-danger-100 dark:bg-danger-900/40 border-b border-danger-200 dark:border-danger-800/50">
          <svg className="w-5 h-5 text-danger-600 dark:text-danger-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <p className="text-sm font-bold text-danger-700 dark:text-danger-300 uppercase tracking-wide">
            Système de sécurité de très haut niveau
          </p>
        </div>
        <div className="p-4 space-y-3">
          {ANTICHEAT.map(({ icon, text }, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="shrink-0 mt-0.5 text-danger-500 dark:text-danger-400">{icon}</span>
              <p
                className="text-sm leading-relaxed text-danger-800 dark:text-danger-300"
                dangerouslySetInnerHTML={{ __html: text() }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Saisie du code d'accès */}
      {codeStep && (exam as any).requires_code && (
        <div className="rounded-2xl border border-primary-200 dark:border-primary-800/50 bg-primary-50 dark:bg-primary-950/30 p-5 space-y-4">
          <div className="flex items-center gap-2.5">
            <svg className="w-5 h-5 text-primary-600 dark:text-primary-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
            </svg>
            <p className="text-sm font-bold text-primary-700 dark:text-primary-300">Code d'accès requis</p>
          </div>
          <p className="text-sm text-primary-600 dark:text-primary-400">
            Votre professeur vous a communiqué un code à 6 caractères. Saisissez-le pour accéder à l'examen.
          </p>
          <input
            type="text"
            value={codeInput}
            onChange={e => { setCodeInput(e.target.value.toUpperCase()); setCodeError('') }}
            placeholder="Ex : AB3K7Z"
            maxLength={8}
            className={`w-full text-center text-2xl font-mono tracking-[0.4em] rounded-xl border-2 px-4 py-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none transition-colors ${codeError ? 'border-danger-400 dark:border-danger-600' : 'border-primary-300 dark:border-primary-700 focus:border-primary-500'}`}
          />
          {codeError && (
            <p className="text-sm text-danger-600 dark:text-danger-400 font-medium">{codeError}</p>
          )}
        </div>
      )}

      {/* Action */}
      <div className="flex flex-col items-center gap-3 pb-4">
        {exam.canTake ? (
          <>
            <Button size="lg" onClick={handleStart} isLoading={isStarting} className="w-full sm:w-auto px-10"
              disabled={codeStep && !codeInput.trim()}>
              {isStarting ? 'Démarrage…' : codeStep ? 'Valider le code' : "Commencer l'examen"}
            </Button>
            {!codeStep && <p className="text-xs text-slate-400 dark:text-slate-500">
              En cliquant, vous acceptez de respecter les règles de l'examen
            </p>}
          </>
        ) : (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800/40">
            <svg className="w-5 h-5 text-danger-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
            <p className="text-sm font-medium text-danger-700 dark:text-danger-300">
              Vous avez épuisé toutes vos tentatives pour cet examen.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
