import { useState, useEffect, type FormEvent } from 'react'
import { studentService } from '../../services/studentService'
import Card from '../../components/common/Card'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import { GroupFormData, Group } from '../../types'
import toast from 'react-hot-toast'

export default function GroupList() {
  const [groups, setGroups] = useState<Group[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [groupModal, setGroupModal] = useState<{
    isOpen: boolean
    group: GroupFormData | null
    editId: string | null
  }>({ isOpen: false, group: null, editId: null })

  useEffect(() => {
    loadGroups()
  }, [])

  const loadGroups = async () => {
    try {
      const { groups: data } = await studentService.getAllGroups()
      setGroups(data)
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!groupModal.group) return

    try {
      if (groupModal.editId) {
        await studentService.updateGroup(groupModal.editId, groupModal.group)
        toast.success('Classe mise à jour')
      } else {
        await studentService.createGroup(groupModal.group)
        toast.success('Classe créée')
      }
      loadGroups()
      setGroupModal({ isOpen: false, group: null, editId: null })
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erreur')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette classe ?')) return

    try {
      await studentService.deleteGroup(id)
      toast.success('Classe supprimée')
      loadGroups()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erreur')
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-32 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700" />
            <div className="h-4 w-52 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700" />
          </div>
          <div className="h-10 w-36 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-700" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="page-title">Classes</h1>
          <p className="page-subtitle">Gérez les classes d'étudiants et leur rattachement aux examens</p>
        </div>
        <Button onClick={() => setGroupModal({ isOpen: true, group: { nom: '', description: '' }, editId: null })}>
          <IconPlus />
          Nouvelle classe
        </Button>
      </div>

      {groups.length === 0 ? (
        <Card>
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
              <IconGroup />
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">Aucune classe</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Créez votre première classe d'étudiants.</p>
            <div className="mt-4">
              <Button size="sm" onClick={() => setGroupModal({ isOpen: true, group: { nom: '', description: '' }, editId: null })}>
                <IconPlus />
                Nouvelle classe
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <Card key={group.id} className="transition-all duration-200 hover:shadow-card-hover">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-base font-semibold text-slate-900 dark:text-white">{group.nom}</h3>
                  {group.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{group.description}</p>
                  )}
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button variant="ghost" size="sm" onClick={() => setGroupModal({ isOpen: true, group: { nom: group.nom, description: group.description || '' }, editId: group.id })}>
                    Modifier
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(group.id)}
                    className="text-danger-600 dark:text-danger-400 hover:text-danger-700 dark:hover:text-danger-300"
                  >
                    Supprimer
                  </Button>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-sm dark:border-slate-700/60">
                <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                  <IconUsers />
                  {group._count?.users || 0} étudiant{(group._count?.users || 0) > 1 ? 's' : ''}
                </span>
                <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                  <IconDocument />
                  {group._count?.exams || 0} examen{(group._count?.exams || 0) > 1 ? 's' : ''}
                </span>
              </div>

              {group.users && group.users.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {group.users.slice(0, 5).map((user) => (
                    <span
                      key={user.id}
                      className="rounded-full bg-primary-100 px-2 py-0.5 text-xs text-primary-700 dark:bg-primary-900/40 dark:text-primary-300"
                    >
                      {user.prenom} {user.nom}
                    </span>
                  ))}
                  {group.users.length > 5 && (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                      +{group.users.length - 5}
                    </span>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={groupModal.isOpen}
        onClose={() => setGroupModal({ isOpen: false, group: null, editId: null })}
        title={groupModal.editId ? 'Modifier la classe' : 'Nouvelle classe'}
        size="sm"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nom de la classe"
            value={groupModal.group?.nom || ''}
            onChange={(e) => setGroupModal({ ...groupModal, group: { ...groupModal.group!, nom: e.target.value } })}
            required
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
            <textarea
              value={groupModal.group?.description || ''}
              onChange={(e) => setGroupModal({ ...groupModal, group: { ...groupModal.group!, description: e.target.value } })}
              className="w-full resize-none rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 transition-colors placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:ring-primary-400"
              rows={3}
              placeholder="Description de la classe (optionnelle)"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setGroupModal({ isOpen: false, group: null, editId: null })}>
              Annuler
            </Button>
            <Button type="submit">
              {groupModal.editId ? 'Enregistrer' : 'Créer'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

function IconPlus() {
  return <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
}

function IconGroup() {
  return <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477" /></svg>
}

function IconUsers() {
  return <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 19.5a7.5 7.5 0 0115 0" /></svg>
}

function IconDocument() {
  return <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 21h-15A1.5 1.5 0 013 19.5v-15A1.5 1.5 0 014.5 3H15l6 6v10.5A1.5 1.5 0 0119.5 21zM15 3v6h6" /></svg>
}
