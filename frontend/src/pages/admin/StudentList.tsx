import { useState, useEffect, type FormEvent } from 'react'
import { studentService } from '../../services/studentService'
import { getSocket } from '../../services/socketService'
import Card from '../../components/common/Card'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import { User } from '../../types'
import toast from 'react-hot-toast'

const DEFAULT_PASSWORD = 'Esgis2026'

// ── Composants utilitaires ────────────────────────────────────────

function OnlineDot({ isOnline }: { isOnline: boolean }) {
  return (
    <span
      title={isOnline ? 'En ligne' : 'Hors ligne'}
      className={`inline-block w-2.5 h-2.5 rounded-full shrink-0 ring-2 ring-white dark:ring-slate-900 ${
        isOnline ? 'bg-success-500' : 'bg-slate-300 dark:bg-slate-600'
      }`}
    />
  )
}

// Icône oeil seule (pas un bouton) — enveloppée dans <button> au niveau du parent
function EyeIcon({ show }: { show: boolean }) {
  return show
    ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
      </svg>
    : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
}

function IconCopy() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
    </svg>
  )
}

// ── Page principale ────────────────────────────────────────────────

export default function StudentList() {
  const [students, setStudents]       = useState<User[]>([])
  const [groups, setGroups]           = useState<{ id: string; nom: string }[]>([])
  const [isLoading, setIsLoading]     = useState(true)
  const [search, setSearch]           = useState('')
  const [visiblePwd, setVisiblePwd]   = useState<Set<string>>(new Set())
  const [pwdModal, setPwdModal] = useState<{
    open: boolean; student: User | null
    newPwd: string; showCurrent: boolean; showNew: boolean; isSaving: boolean
  }>({ open: false, student: null, newPwd: '', showCurrent: false, showNew: false, isSaving: false })
  const [studentModal, setStudentModal] = useState<{
    isOpen: boolean
    student: { email: string; nom: string; prenom: string; password: string }
    editId: string | null
    showPwd: boolean
    selectedGroupIds: string[]
  }>({
    isOpen: false,
    student: { email: '', nom: '', prenom: '', password: DEFAULT_PASSWORD },
    editId: null,
    showPwd: false,
    selectedGroupIds: [],
  })
  const [importModal, setImportModal] = useState(false)
  const [importData, setImportData]   = useState('')
  const [importGroupId, setImportGroupId] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadStudents()
    loadGroups()
  }, [])

  // Statut en ligne via socket
  useEffect(() => {
    const socket = getSocket()
    if (!socket) return
    const handler = ({ userId, is_online }: { userId: string; is_online: boolean }) => {
      setStudents(prev => prev.map(s => s.id === userId ? { ...s, is_online } : s))
    }
    socket.on('user:status', handler)
    return () => { socket.off('user:status', handler) }
  }, [])

  const loadStudents = async () => {
    try {
      const { students: data } = await studentService.getAllStudents()
      setStudents(data as unknown as User[])
    } catch { /* silencieux */ }
    finally { setIsLoading(false) }
  }

  const loadGroups = async () => {
    try {
      const { groups: data } = await studentService.getAllGroups()
      setGroups(data.map((g: any) => ({ id: g.id, nom: g.nom })))
    } catch { /* silencieux */ }
  }

  const toggleGroup = (groupId: string) => {
    setStudentModal(m => ({
      ...m,
      selectedGroupIds: m.selectedGroupIds.includes(groupId)
        ? m.selectedGroupIds.filter(id => id !== groupId)
        : [...m.selectedGroupIds, groupId],
    }))
  }

  const togglePwdVisibility = (id: string) => {
    setVisiblePwd(prev => {
      const s = new Set(prev)
      s.has(id) ? s.delete(id) : s.add(id)
      return s
    })
  }

  const EMPTY_MODAL = { isOpen: false, student: { email: '', nom: '', prenom: '', password: DEFAULT_PASSWORD }, editId: null, showPwd: false, selectedGroupIds: [] as string[] }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const { student, editId, selectedGroupIds } = studentModal
    try {
      if (editId) {
        await studentService.updateStudent(editId, { ...student, groupIds: selectedGroupIds } as any)
        toast.success('Étudiant mis à jour')
      } else {
        await studentService.createStudent({ ...student, groupIds: selectedGroupIds } as any)
        toast.success(`Étudiant créé — mot de passe : ${student.password}`)
      }
      loadStudents()
      setStudentModal(EMPTY_MODAL)
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erreur')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cet étudiant ?')) return
    try {
      await studentService.deleteStudent(id)
      toast.success('Étudiant supprimé')
      loadStudents()
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erreur')
    }
  }

  const closePwdModal = () => setPwdModal({ open: false, student: null, newPwd: '', showCurrent: false, showNew: false, isSaving: false })

  const handleSetPassword = async (password: string) => {
    if (!pwdModal.student) return
    setPwdModal(m => ({ ...m, isSaving: true }))
    try {
      await studentService.resetPassword(pwdModal.student.id, password)
      toast.success('Mot de passe mis à jour')
      loadStudents()
      // Rester ouvert et afficher le nouveau mot de passe dans la section "actuel"
      setPwdModal(m => ({
        ...m,
        isSaving: false,
        newPwd: '',
        showCurrent: true,
        student: m.student ? { ...m.student, password_temp: password, must_change_password: true } as any : null,
      }))
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erreur')
      setPwdModal(m => ({ ...m, isSaving: false }))
    }
  }

  const allFilteredSelected = filtered.length > 0 && filtered.every(s => selectedIds.has(s.id))

  const handleSelectAll = () => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (allFilteredSelected) filtered.forEach(s => next.delete(s.id))
      else filtered.forEach(s => next.add(s.id))
      return next
    })
  }

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return
    if (!confirm(`Supprimer ${selectedIds.size} étudiant(s) sélectionné(s) ? Cette action est irréversible.`)) return
    try {
      await Promise.all([...selectedIds].map(id => studentService.deleteStudent(id)))
      toast.success(`${selectedIds.size} étudiant(s) supprimé(s)`)
      setSelectedIds(new Set())
      loadStudents()
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erreur lors de la suppression')
    }
  }

  const handleImport = async () => {
    try {
      const lines = importData.trim().split('\n')
      const list  = lines.map(line => {
        const [nom, prenom, email] = line.split(',').map(s => s.trim())
        return { nom, prenom, email }
      })
      const result = await studentService.importStudents(list, importGroupId || undefined)
      toast.success(`${result.students.length} étudiant(s) importé(s) — mot de passe par défaut : ${DEFAULT_PASSWORD}`)
      loadStudents()
      setImportModal(false)
      setImportData('')
      setImportGroupId('')
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erreur')
    }
  }

  const filtered = students.filter(s =>
    `${s.nom} ${s.prenom} ${s.email}`.toLowerCase().includes(search.toLowerCase())
  )

  if (isLoading) return (
    <div className="space-y-4 animate-pulse">
      <div className="flex justify-between">
        <div className="skeleton h-8 w-40 rounded-xl" />
        <div className="skeleton h-9 w-36 rounded-xl" />
      </div>
      <div className="skeleton h-96 rounded-2xl" />
    </div>
  )

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Étudiants</h1>
          <p className="page-subtitle">{students.length} étudiant{students.length > 1 ? 's' : ''} inscrit{students.length > 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-2">
          {selectedIds.size > 0 && (
            <Button
              size="sm"
              onClick={handleBulkDelete}
              className="bg-danger-500 hover:bg-danger-600 text-white border-0"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
              Supprimer ({selectedIds.size})
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => setImportModal(true)}>
            Importer CSV
          </Button>
          <Button size="sm" onClick={() => setStudentModal({ ...EMPTY_MODAL, isOpen: true })}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Ajouter
          </Button>
        </div>
      </div>

      {/* Note mot de passe par défaut */}
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800/40 text-sm">
        <svg className="w-4 h-4 text-primary-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
        </svg>
        <span className="text-primary-700 dark:text-primary-300">
          Mot de passe standard des nouveaux étudiants&nbsp;:&nbsp;
          <code className="font-mono font-bold">{DEFAULT_PASSWORD}</code>
          &nbsp;— L'étudiant devra le modifier à la première connexion.
        </span>
      </div>

      {/* Tableau */}
      <Card noPadding>
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700/60">
          <Input
            placeholder="Rechercher par nom, prénom ou email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700/60">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={allFilteredSelected}
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500 cursor-pointer"
                  />
                </th>
                {['Étudiant', 'Mot de passe', 'Classes', 'Statut', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-400 dark:text-slate-500">
                    Aucun étudiant trouvé
                  </td>
                </tr>
              ) : filtered.map(student => {
                const showPwd = visiblePwd.has(student.id)
                const hasTempPwd = !!(student as any).password_temp
                const mustChange = !!(student as any).must_change_password
                const isSelected = selectedIds.has(student.id)

                return (
                  <tr key={student.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${isSelected ? 'bg-primary-50 dark:bg-primary-900/10' : ''}`}>
                    <td className="px-4 py-4 w-10">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectOne(student.id)}
                        className="rounded border-slate-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500 cursor-pointer"
                      />
                    </td>
                    {/* Nom + statut en ligne */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <OnlineDot isOnline={student.is_online ?? false} />
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">
                            {student.prenom} {student.nom}
                          </p>
                          <p className="text-xs text-slate-400 dark:text-slate-500">{student.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Mot de passe */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      {hasTempPwd ? (
                        <div className="flex items-center gap-2">
                          <code className={`text-sm font-mono ${showPwd ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500'}`}>
                            {showPwd ? (student as any).password_temp : '••••••••'}
                          </code>
                          <button
                            type="button"
                            onClick={() => togglePwdVisibility(student.id)}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                            title={showPwd ? 'Masquer' : 'Afficher'}
                          >
                            <EyeIcon show={showPwd} />
                          </button>
                          {mustChange && (
                            <span className="badge badge-warning text-[10px]">Non modifié</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-success-600 dark:text-success-400 flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                          </svg>
                          Modifié par l'étudiant
                        </span>
                      )}
                    </td>

                    {/* Classes */}
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(student as any).groups?.map((g: any) => (
                          <span key={g.id} className="badge badge-primary">{g.nom}</span>
                        ))}
                      </div>
                    </td>

                    {/* Statut connexion */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className={`badge ${student.is_online ? 'badge-success' : 'badge-neutral'}`}>
                        {student.is_online ? 'En ligne' : 'Hors ligne'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost" size="sm"
                          onClick={() => setStudentModal({
                            isOpen: true,
                            student: { email: student.email, nom: student.nom, prenom: student.prenom, password: '' },
                            editId: student.id,
                            showPwd: false,
                            selectedGroupIds: (student as any).groups?.map((g: any) => g.id) ?? [],
                          })}
                        >
                          Modifier
                        </Button>
                        <Button
                          variant="ghost" size="sm"
                          title="Gérer le mot de passe"
                          onClick={() => setPwdModal({ open: true, student, newPwd: '', showCurrent: false, showNew: false, isSaving: false })}
                          className="text-warning-600 dark:text-warning-400 hover:bg-warning-50 dark:hover:bg-warning-900/20"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                          </svg>
                        </Button>
                        <Button
                          variant="ghost" size="sm"
                          onClick={() => handleDelete(student.id)}
                          className="text-danger-500 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/20"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Modal créer / modifier étudiant ────────────────────── */}
      <Modal
        isOpen={studentModal.isOpen}
        onClose={() => setStudentModal(EMPTY_MODAL)}
        title={studentModal.editId ? "Modifier l'étudiant" : 'Nouvel étudiant'}
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setStudentModal(EMPTY_MODAL)}>Annuler</Button>
            <Button onClick={handleSubmit as any}>
              {studentModal.editId ? 'Enregistrer' : 'Créer'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Prénom"
              value={studentModal.student.prenom}
              onChange={e => setStudentModal(m => ({ ...m, student: { ...m.student, prenom: e.target.value } }))}
              required
            />
            <Input
              label="Nom"
              value={studentModal.student.nom}
              onChange={e => setStudentModal(m => ({ ...m, student: { ...m.student, nom: e.target.value } }))}
              required
            />
          </div>
          <Input
            label="Email"
            type="email"
            value={studentModal.student.email}
            onChange={e => setStudentModal(m => ({ ...m, student: { ...m.student, email: e.target.value } }))}
            required
          />

          {/* Mot de passe avec toggle oeil */}
          <div className="relative">
            <Input
              label={studentModal.editId ? 'Nouveau mot de passe (laisser vide pour ne pas changer)' : 'Mot de passe'}
              type={studentModal.showPwd ? 'text' : 'password'}
              value={studentModal.student.password}
              onChange={e => setStudentModal(m => ({ ...m, student: { ...m.student, password: e.target.value } }))}
              placeholder={studentModal.editId ? 'Laisser vide pour conserver' : DEFAULT_PASSWORD}
              required={!studentModal.editId}
              hint={!studentModal.editId ? `Défaut : ${DEFAULT_PASSWORD} — l'étudiant devra le modifier` : undefined}
            />
            <button
              type="button"
              onClick={() => setStudentModal(m => ({ ...m, showPwd: !m.showPwd }))}
              className="absolute right-3 top-8 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              title={studentModal.showPwd ? 'Masquer' : 'Afficher'}
            >
              <EyeIcon show={studentModal.showPwd} />
            </button>
          </div>

              {/* Sélection des classes */}
          {groups.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Classes
              </label>
              <div className="flex flex-wrap gap-2">
                {groups.map(g => {
                  const selected = studentModal.selectedGroupIds.includes(g.id)
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => toggleGroup(g.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all ${
                        selected
                          ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:border-primary-400 dark:text-primary-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      {selected && (
                        <svg className="w-3 h-3 mr-1 inline" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                        </svg>
                      )}
                      {g.nom}
                    </button>
                  )
                })}
              </div>
              {studentModal.selectedGroupIds.length > 0 && (
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">
                  {studentModal.selectedGroupIds.length} groupe{studentModal.selectedGroupIds.length > 1 ? 's' : ''} sélectionné{studentModal.selectedGroupIds.length > 1 ? 's' : ''}
                </p>
              )}
            </div>
          )}
        </form>
      </Modal>

      {/* ── Modal mot de passe unifié ──────────────────────────── */}
      <Modal
        isOpen={pwdModal.open}
        onClose={closePwdModal}
        title="Mot de passe"
        description={`${pwdModal.student?.prenom} ${pwdModal.student?.nom}`}
        size="sm"
        footer={<Button variant="outline" onClick={closePwdModal}>Fermer</Button>}
      >
        <div className="space-y-5">

          {/* ── 1. Mot de passe actuel ── */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Mot de passe actuel</p>
            {(pwdModal.student as any)?.password_temp ? (
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm font-mono text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2">
                  {pwdModal.showCurrent ? (pwdModal.student as any).password_temp : '••••••••••'}
                </code>
                <button
                  type="button"
                  onClick={() => setPwdModal(m => ({ ...m, showCurrent: !m.showCurrent }))}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  title={pwdModal.showCurrent ? 'Masquer' : 'Voir'}
                >
                  <EyeIcon show={pwdModal.showCurrent} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText((pwdModal.student as any).password_temp)
                    toast.success('Copié !')
                  }}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  title="Copier"
                >
                  <IconCopy />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm">
                <svg className="w-4 h-4 text-success-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                </svg>
                <span className="text-success-600 dark:text-success-400 font-medium">Modifié par l'étudiant</span>
              </div>
            )}
            {(pwdModal.student as any)?.must_change_password && (
              <p className="text-xs text-warning-600 dark:text-warning-400">
                ⚠ L'étudiant n'a pas encore changé ce mot de passe.
              </p>
            )}
          </div>

          {/* ── 2. Définir un nouveau mot de passe ── */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Définir un nouveau mot de passe</p>
            <div className="relative">
              <Input
                label=""
                type={pwdModal.showNew ? 'text' : 'password'}
                value={pwdModal.newPwd}
                onChange={e => setPwdModal(m => ({ ...m, newPwd: e.target.value }))}
                placeholder="Nouveau mot de passe..."
              />
              <button
                type="button"
                onClick={() => setPwdModal(m => ({ ...m, showNew: !m.showNew }))}
                className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <EyeIcon show={pwdModal.showNew} />
              </button>
            </div>
            <Button
              className="w-full"
              isLoading={pwdModal.isSaving}
              disabled={!pwdModal.newPwd.trim()}
              onClick={() => handleSetPassword(pwdModal.newPwd)}
            >
              Appliquer
            </Button>
          </div>

          {/* ── 3. Réinitialiser au défaut ── */}
          <div className="rounded-xl border border-warning-200 dark:border-warning-800/40 bg-warning-50 dark:bg-warning-900/10 p-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-warning-600 dark:text-warning-400">Réinitialiser</p>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Remettre le mot de passe par défaut&nbsp;: <code className="font-mono font-bold">{DEFAULT_PASSWORD}</code>
            </p>
            <Button
              variant="outline"
              className="w-full border-warning-300 text-warning-700 hover:bg-warning-100 dark:border-warning-700 dark:text-warning-400"
              isLoading={pwdModal.isSaving}
              onClick={() => handleSetPassword(DEFAULT_PASSWORD)}
            >
              Réinitialiser au mot de passe par défaut
            </Button>
          </div>

        </div>
      </Modal>

      {/* ── Modal import CSV ───────────────────────────────────── */}
      <Modal isOpen={importModal} onClose={() => setImportModal(false)} title="Importer des étudiants" size="md"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setImportModal(false)}>Annuler</Button>
            <Button onClick={handleImport}>Importer</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Format&nbsp;: <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono">nom,prenom,email</code> — un par ligne.
            Le mot de passe par défaut <code className="font-mono font-bold">{DEFAULT_PASSWORD}</code> sera appliqué à tous.
          </p>
          <textarea
            value={importData}
            onChange={e => setImportData(e.target.value)}
            rows={6}
            placeholder={'Dupont,Jean,jean.dupont@example.com\nMartin,Marie,marie.martin@example.com'}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none transition-all"
          />
          {groups.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Assigner à une classe <span className="text-slate-400 font-normal">(optionnel)</span>
              </label>
              <select
                value={importGroupId}
                onChange={e => setImportGroupId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
              >
                <option value="">— Aucune classe —</option>
                {groups.map(g => (
                  <option key={g.id} value={g.id}>{g.nom}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}
