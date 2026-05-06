import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import { useAuth } from '../../context/AuthContext'

export default function ChangePassword() {
  const { user, changePassword, logout } = useAuth()
  const navigate = useNavigate()

  const [currentPwd, setCurrentPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const isForced = user?.must_change_password === true

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!isForced && !currentPwd.trim()) {
      toast.error('Le mot de passe actuel est requis')
      return
    }
    if (newPwd.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères')
      return
    }
    if (newPwd !== confirm) {
      toast.error('Les mots de passe ne correspondent pas')
      return
    }

    setIsLoading(true)
    try {
      await changePassword(isForced ? null : currentPwd, newPwd)
      toast.success('Mot de passe modifié avec succès')
      navigate(user?.role === 'ADMIN' ? '/admin/dashboard' : '/student/dashboard', { replace: true })
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      toast.error(e.response?.data?.error || 'Erreur lors du changement')
    } finally {
      setIsLoading(false)
    }
  }

  const strength = strengthScore(newPwd)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-primary-500/20 blur-3xl" />
        <div className="absolute right-0 top-40 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-fuchsia-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-10">
        <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col justify-between rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl lg:p-12">
            <div className="inline-flex items-center gap-3">
              <BrandMark />
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400">QCM Pro</p>
                <p className="font-display text-xl font-semibold text-white">Sécurité du compte</p>
              </div>
            </div>

            <div className="mt-14 max-w-xl">
              <p className="text-sm font-medium uppercase tracking-[0.3em] text-primary-300">Compte protégé</p>
              <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-white sm:text-5xl">
                {isForced ? 'Définissez votre mot de passe' : 'Changez votre mot de passe'}
              </h1>
              <p className="mt-5 max-w-lg text-base leading-7 text-slate-300">
                Nous gardons le parcours simple, clair et sécurisé. Choisissez un mot de passe solide pour continuer vers votre tableau de bord.
              </p>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              <InfoPill title="Chiffrement" value="JWT" />
              <InfoPill title="Accès" value="Protégé" />
              <InfoPill title="Style" value="Professionnel" />
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200/80 bg-white p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900 sm:p-10">
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary-600 dark:text-primary-400">
                {isForced ? 'Action requise' : 'Mise à jour'}
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold text-slate-900 dark:text-white">
                {isForced ? 'Créer un nouveau mot de passe' : 'Modifier mon mot de passe'}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Bonjour {user?.prenom}, choisissez un mot de passe robuste et gardez-le confidentiel.
              </p>
            </div>

            {isForced && (
              <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900 dark:border-amber-800/40 dark:bg-amber-950/30 dark:text-amber-200">
                <IconAlert />
                <div>
                  <p className="font-semibold">Changement obligatoire</p>
                  <p className="mt-1 text-sm text-amber-800 dark:text-amber-300">
                    Votre administrateur a demandé une mise à jour de sécurité avant la poursuite.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isForced && (
                <FieldWithToggle
                  label="Mot de passe actuel"
                  value={currentPwd}
                  onChange={setCurrentPwd}
                  show={showCurrent}
                  toggle={() => setShowCurrent(v => !v)}
                  placeholder="Entrez votre mot de passe actuel"
                />
              )}

              <FieldWithToggle
                label="Nouveau mot de passe"
                value={newPwd}
                onChange={setNewPwd}
                show={showNew}
                toggle={() => setShowNew(v => !v)}
                placeholder="Minimum 6 caractères"
              />

              <FieldWithToggle
                label="Confirmer le mot de passe"
                value={confirm}
                onChange={setConfirm}
                show={showConfirm}
                toggle={() => setShowConfirm(v => !v)}
                placeholder="Répétez le mot de passe"
                error={confirm && confirm !== newPwd ? 'Les mots de passe ne correspondent pas' : undefined}
              />

              {newPwd.length > 0 && (
                <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
                  <div className="flex gap-1">
                    {[0, 1, 2, 3].map(level => (
                      <div
                        key={level}
                        className={`h-1.5 flex-1 rounded-full transition-colors ${
                          level < strength
                            ? strength <= 1
                              ? 'bg-rose-500'
                              : strength <= 2
                                ? 'bg-amber-500'
                                : strength === 3
                                  ? 'bg-primary-500'
                                  : 'bg-emerald-500'
                            : 'bg-slate-200 dark:bg-slate-800'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Force du mot de passe: {['Très faible', 'Faible', 'Correct', 'Fort', 'Très fort'][strength]}
                  </p>
                </div>
              )}

              <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                Enregistrer le mot de passe
              </Button>
            </form>

            <div className="mt-5 flex flex-col gap-2">
              {!isForced ? (
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  Retour
                </button>
              ) : (
                <button
                  type="button"
                  onClick={logout}
                  className="text-sm font-medium text-slate-500 transition-colors hover:text-rose-500 dark:text-slate-400"
                >
                  Se déconnecter
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function strengthScore(pwd: string): number {
  let score = 0
  if (pwd.length >= 6) score++
  if (pwd.length >= 10) score++
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++
  if (/[0-9]/.test(pwd)) score++
  if (/[^A-Za-z0-9]/.test(pwd)) score++
  return Math.min(4, score)
}

function FieldWithToggle({
  label,
  value,
  onChange,
  show,
  toggle,
  placeholder,
  error,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  show: boolean
  toggle: () => void
  placeholder: string
  error?: string
}) {
  return (
    <div className="space-y-1.5">
      <Input
        id={label}
        label={label}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required
        error={error}
      />
      <button
        type="button"
        onClick={toggle}
        className="-mt-10 ml-auto mr-3 flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        aria-label="Afficher ou masquer le mot de passe"
      >
        {show ? <IconEyeOff /> : <IconEye />}
      </button>
    </div>
  )
}

function InfoPill({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{title}</p>
      <p className="mt-1 font-semibold text-white">{value}</p>
    </div>
  )
}

function BrandMark() {
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
      <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path d="M4 7.5A3.5 3.5 0 0 1 7.5 4H16a4 4 0 0 1 0 8H8.5A3.5 3.5 0 0 0 5 15.5 3.5 3.5 0 0 0 8.5 19H20" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 7h6" strokeLinecap="round" />
      </svg>
    </div>
  )
}

function IconEye() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322C3.42 8.151 7.358 5.145 12 5.145c4.639 0 8.576 3.001 9.964 7.173.07.208.07.43 0 .638C20.576 17.127 16.639 20.13 12 20.13c-4.642 0-8.58-3.007-9.964-7.178a1.01 1.01 0 0 1 0-.63Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.25 12a3.25 3.25 0 1 1-6.5 0 3.25 3.25 0 0 1 6.5 0Z" />
    </svg>
  )
}

function IconEyeOff() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.58 10.58A3.25 3.25 0 0 0 13.42 13.42" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.88 5.7A10.98 10.98 0 0 1 12 5.15c4.64 0 8.58 3.01 9.96 7.18a1.01 1.01 0 0 1 0 .63 13.3 13.3 0 0 1-3.05 4.81" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.2 6.2A13.28 13.28 0 0 0 2.04 12c1.38 4.17 5.32 7.18 9.96 7.18 1.2 0 2.36-.19 3.44-.54" />
    </svg>
  )
}

function IconAlert() {
  return (
    <svg className="mt-0.5 h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86 2.82 17.13A2.25 2.25 0 0 0 4.77 20.5h14.46a2.25 2.25 0 0 0 1.95-3.37L13.71 3.86a2.25 2.25 0 0 0-3.42 0Z" />
    </svg>
  )
}
