import { useState, useEffect, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { examService } from '../../services/examService'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import { Exam } from '../../types'
import toast from 'react-hot-toast'

export default function ExamList() {
  const [exams, setExams] = useState<Exam[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<Exam | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const navigate = useNavigate()

  useEffect(() => { loadExams() }, [])

  const loadExams = async () => {
    try {
      const { exams } = await examService.getAll()
      setExams(exams)
    } catch {
      toast.error('Erreur de chargement')
    } finally {
      setIsLoading(false)
    }
  }

  const allSelected = exams.length > 0 && exams.every(e => selectedIds.has(e.id))

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleSelectAll = () => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (allSelected) exams.forEach(e => next.delete(e.id))
      else exams.forEach(e => next.add(e.id))
      return next
    })
  }

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return
    if (!confirm(`Supprimer ${selectedIds.size} examen(s) sélectionné(s) ? Toutes les questions et tentatives liées seront perdues.`)) return
    try {
      await Promise.all([...selectedIds].map(id => examService.delete(id)))
      toast.success(`${selectedIds.size} examen(s) supprimé(s)`)
      setSelectedIds(new Set())
      loadExams()
    } catch {
      toast.error('Erreur lors de la suppression')
    }
  }

  const handleDuplicate = async (id: string) => {
    try {
      await examService.duplicate(id)
      toast.success('Examen dupliqué')
      loadExams()
    } catch {
      toast.error('Erreur lors de la duplication')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await examService.delete(deleteTarget.id)
      toast.success('Examen supprimé')
      setDeleteTarget(null)
      loadExams()
    } catch {
      toast.error('Erreur lors de la suppression')
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="flex justify-between">
          <div className="skeleton h-8 w-40 rounded-xl" />
          <div className="skeleton h-9 w-36 rounded-xl" />
        </div>
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="page-title">Examens</h1>
          <p className="page-subtitle">{exams.length} examen{exams.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          {exams.length > 0 && (
            <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-500 dark:text-slate-400 select-none">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={handleSelectAll}
                className="rounded border-slate-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500 cursor-pointer"
              />
              Tout sélectionner
            </label>
          )}
          {selectedIds.size > 0 && (
            <Button
              onClick={handleBulkDelete}
              className="bg-danger-500 hover:bg-danger-600 text-white border-0"
              size="sm"
            >
              <IconTrash />
              Supprimer ({selectedIds.size})
            </Button>
          )}
          <Button onClick={() => navigate('/admin/exams/new')}>
            <IconPlus />
            Nouvel examen
          </Button>
        </div>
      </div>

      {exams.length === 0 ? (
        <Card>
          <div className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
              <IconDocument />
            </div>
            <h3 className="mb-1 text-base font-semibold text-slate-800 dark:text-slate-200">Aucun examen</h3>
            <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">Créez votre premier examen pour démarrer.</p>
            <Button onClick={() => navigate('/admin/exams/new')}>Créer un examen</Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {exams.map(exam => {
            const isSelected = selectedIds.has(exam.id)
            return (
            <div
              key={exam.id}
              className={`group rounded-2xl border p-5 transition-all duration-200 hover:shadow-card-hover ${
                isSelected
                  ? 'border-primary-400 bg-primary-50 dark:border-primary-600 dark:bg-primary-900/10'
                  : 'border-slate-200 bg-white hover:border-primary-300 dark:border-slate-700/60 dark:bg-slate-900 dark:hover:border-primary-700'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleSelectOne(exam.id)}
                    className="mt-0.5 rounded border-slate-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500 cursor-pointer shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{exam.titre}</h3>
                      {exam.melange_questions && <span className="badge badge-primary">Aléatoire</span>}
                    </div>
                    {exam.description && (
                      <p className="mb-3 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">{exam.description}</p>
                    )}
                    <div className="flex flex-wrap gap-4">
                      <Meta icon={<IconClock />} value={`${exam.duree_minutes} min`} />
                      <Meta icon={<IconQuestion />} value={`${(exam as any)._count?.questions ?? 0} questions`} />
                      <Meta icon={<IconRepeat />} value={`${exam.tentatives_max} tentative${exam.tentatives_max > 1 ? 's' : ''}`} />
                      <Meta icon={<IconPlay />} value={`${(exam as any)._count?.attempts ?? 0} passages`} />
                    </div>
                    {(exam.date_debut || exam.date_fin) && (
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {exam.date_debut && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-primary-50 text-primary-700 border border-primary-200 dark:bg-primary-900/20 dark:text-primary-400 dark:border-primary-800/40">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Dès le {new Date(exam.date_debut).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                        {exam.date_fin && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-warning-50 text-warning-700 border border-warning-200 dark:bg-warning-900/20 dark:text-warning-400 dark:border-warning-800/40">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            Jusqu'au {new Date(exam.date_fin).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1 sm:gap-2 flex-wrap">
                  <Link to={`/admin/results/${exam.id}`}>
                    <Button variant="ghost" size="sm" className="hidden sm:flex">Résultats</Button>
                  </Link>
                  <Link to={`/admin/exams/${exam.id}/edit`}>
                    <Button variant="outline" size="sm">Modifier</Button>
                  </Link>
                  <Button variant="ghost" size="icon" title="Dupliquer" onClick={() => handleDuplicate(exam.id)}>
                    <IconDuplicate />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Supprimer"
                    onClick={() => setDeleteTarget(exam)}
                    className="text-danger-500 hover:bg-danger-50 dark:text-danger-400 dark:hover:bg-danger-900/30"
                  >
                    <IconTrash />
                  </Button>
                </div>
              </div>
            </div>
          )})}
        </div>
      )}

      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Supprimer l'examen"
        description="Toutes les questions et tentatives liées seront supprimées définitivement."
      >
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteTarget(null)}>Annuler</Button>
          <Button variant="danger" isLoading={isDeleting} onClick={handleDelete}>Supprimer</Button>
        </div>
      </Modal>
    </div>
  )
}

function Meta({ icon, value }: { icon: ReactNode; value: string }) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
      {icon}
      {value}
    </span>
  )
}

function IconPlus() {
  return <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
}

function IconDocument() {
  return <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 21h-15A1.5 1.5 0 013 19.5v-15A1.5 1.5 0 014.5 3H15l6 6v10.5A1.5 1.5 0 0119.5 21zM15 3v6h6" /></svg>
}

function IconClock() {
  return <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
}

function IconQuestion() {
  return <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01" /></svg>
}

function IconRepeat() {
  return <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
}

function IconPlay() {
  return <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" /></svg>
}

function IconDuplicate() {
  return <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25" /></svg>
}

function IconTrash() {
  return <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
}
