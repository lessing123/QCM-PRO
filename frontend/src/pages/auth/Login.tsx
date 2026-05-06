import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import toast from 'react-hot-toast'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const user = await login(email, password)
      toast.success(`Bienvenue, ${user.prenom} !`)
      navigate(user.role === 'ADMIN' ? '/admin/dashboard' : '/student/dashboard', { replace: true })
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      toast.error(e.response?.data?.error || 'Email ou mot de passe incorrect')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[100svh] bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto flex min-h-[100svh] max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <BrandMark />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-700 dark:text-primary-300">QCM Pro</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Plateforme d'examens et de suivi</p>
            </div>
          </div>

          <button
            onClick={toggleTheme}
            className="inline-flex h-10 items-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            title={theme === 'dark' ? 'Passer au mode clair' : 'Passer au mode sombre'}
          >
            {theme === 'dark' ? 'Clair' : 'Sombre'}
          </button>
        </header>

        <main className="grid flex-1 items-center gap-8 py-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-10">
          <section className="space-y-6">
            <div className="max-w-2xl space-y-5">
              <p className="inline-flex items-center rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-primary-700 dark:border-primary-500/20 dark:bg-primary-500/10 dark:text-primary-300">
                Accès sécurisé
              </p>
              <h1 className="font-display text-4xl font-bold leading-tight text-slate-900 sm:text-5xl dark:text-white">
                Une interface claire, institutionnelle et rapide pour gérer les examens.
              </h1>
              <p className="max-w-xl text-base leading-7 text-slate-600 dark:text-slate-400">
                Suivez les classes, les notes et les résultats depuis un espace pensé comme un portail sérieux, sobre et facile à utiliser sur mobile comme sur desktop.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <FeatureCard title="Navigation" text="Clair et direct" />
              <FeatureCard title="Style" text="Sobre et officiel" />
              <FeatureCard title="Responsive" text="Optimisé mobile" />
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Repères</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-3xl font-bold text-primary-700 dark:text-primary-300">01</p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Connexion rapide avec accès étudiant ou administrateur.</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary-700 dark:text-primary-300">02</p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Interface propre, lisible et pensée pour durer.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="relative">
            <div className="absolute -left-8 -top-8 h-24 w-24 rounded-full bg-primary-200/60 blur-3xl dark:bg-primary-500/20" />
            <div className="absolute -bottom-8 right-0 h-24 w-24 rounded-full bg-sky-200/60 blur-3xl dark:bg-sky-500/20" />

            <div className="relative rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900 sm:p-8">
              <div className="mb-8 space-y-2">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-700 dark:text-primary-300">Connexion</p>
                <h2 className="font-display text-3xl font-bold text-slate-900 dark:text-white">Accéder à mon espace</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Veuillez vous authentifier pour continuer.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  id="email"
                  label="Adresse email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="vous@exemple.com"
                  autoComplete="email"
                  required
                  leftIcon={<IconMail />}
                />

                <div className="relative">
                  <Input
                    id="password"
                    label="Mot de passe"
                    type={showPwd ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                    leftIcon={<IconLock />}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(v => !v)}
                    className="absolute right-3 bottom-2.5 text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {showPwd ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>

                <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                  Se connecter
                </Button>
              </form>

              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                <p className="font-semibold text-slate-900 dark:text-white">Accès rapide</p>
                <p className="mt-1">Compte admin de démonstration disponible pour les tests locaux.</p>
                <button
                  type="button"
                  onClick={() => { setEmail('admin@test.com'); setPassword('admin123') }}
                  className="mt-3 text-sm font-semibold text-primary-700 hover:text-primary-800 dark:text-primary-300 dark:hover:text-primary-200"
                >
                  Préremplir les identifiants
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

function BrandMark() {
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-700 text-white shadow-sm">
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 6.75h15M4.5 12h9M4.5 17.25h15" />
      </svg>
    </div>
  )
}

function FeatureCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-card dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{title}</p>
      <p className="mt-2 text-sm font-medium text-slate-800 dark:text-slate-200">{text}</p>
    </div>
  )
}

function IconMail() {
  return <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
}

function IconLock() {
  return <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
}

function IconEye() {
  return <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
}

function IconEyeOff() {
  return <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
}
