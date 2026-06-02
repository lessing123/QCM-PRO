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
    <div className="flex min-h-[100svh] bg-white dark:bg-slate-950">
      {/* Panneau gauche — image + branding */}
      <div className="relative hidden w-1/2 flex-col items-center justify-end bg-primary-700 pb-16 lg:flex">
        <img
          src="/work.jpg"
          alt="QCM Pro"
          className="absolute inset-0 h-full w-full object-cover opacity-20"
        />
        <div className="relative z-10 text-center text-white">
          <p className="text-6xl font-extrabold tracking-wide drop-shadow-lg">QCM Pro</p>
          <p className="mt-3 text-xl font-semibold text-primary-200 drop-shadow">Plateforme d'examens et de suivi</p>
        </div>
      </div>

      {/* Panneau droit — formulaire */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 lg:w-1/2">
        <div className="absolute right-4 top-4">
          <button
            onClick={toggleTheme}
            className="inline-flex h-9 items-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {theme === 'dark' ? 'Clair' : 'Sombre'}
          </button>
        </div>

        {/* Logo visible uniquement sur mobile */}
        <div className="mb-8 text-center lg:hidden">
          <p className="text-2xl font-bold text-primary-700 dark:text-primary-400">QCM Pro</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Plateforme d'examens et de suivi</p>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Connexion</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Veuillez vous authentifier pour continuer.</p>
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

        </div>
      </div>
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
