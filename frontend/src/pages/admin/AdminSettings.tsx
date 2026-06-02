import { useState, type FormEvent } from 'react'
import { authService } from '../../services/authService'
import Card from '../../components/common/Card'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import toast from 'react-hot-toast'

export default function AdminSettings() {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNext, setShowNext] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (next.length < 6) {
      toast.error('Le nouveau mot de passe doit contenir au moins 6 caractères')
      return
    }
    if (next !== confirm) {
      toast.error('Les mots de passe ne correspondent pas')
      return
    }
    setIsLoading(true)
    try {
      await authService.changePassword(current, next)
      toast.success('Mot de passe modifié avec succès')
      setCurrent('')
      setNext('')
      setConfirm('')
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      toast.error(e.response?.data?.error || 'Erreur lors du changement de mot de passe')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Paramètres</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Gérez votre compte administrateur</p>
      </div>

      <div className="max-w-md">
        <Card title="Changer le mot de passe">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Mot de passe actuel"
              type={showCurrent ? 'text' : 'password'}
              value={current}
              onChange={e => setCurrent(e.target.value)}
              placeholder="••••••••"
              required
              rightIcon={
                <button type="button" onClick={() => setShowCurrent(v => !v)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                  {showCurrent ? <IconEyeOff /> : <IconEye />}
                </button>
              }
            />

            <Input
              label="Nouveau mot de passe"
              type={showNext ? 'text' : 'password'}
              value={next}
              onChange={e => setNext(e.target.value)}
              placeholder="Minimum 6 caractères"
              required
              rightIcon={
                <button type="button" onClick={() => setShowNext(v => !v)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                  {showNext ? <IconEyeOff /> : <IconEye />}
                </button>
              }
            />

            <Input
              label="Confirmer le nouveau mot de passe"
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="••••••••"
              required
            />

            <div className="pt-2">
              <Button type="submit" isLoading={isLoading} className="w-full">
                Enregistrer
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}

const IconEye = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const IconEyeOff = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
  </svg>
)
