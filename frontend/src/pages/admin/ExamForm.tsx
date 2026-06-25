import { useState, useEffect, useRef, type ChangeEvent, type FormEvent } from 'react'
import * as XLSX from 'xlsx'
import { useNavigate, useParams } from 'react-router-dom'
import { examService } from '../../services/examService'
import { studentService } from '../../services/studentService'
import Card from '../../components/common/Card'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import { ExamFormData, QuestionFormData, Group, QuestionType } from '../../types'
import { resolveMediaUrl } from '../../utils/media'
import toast from 'react-hot-toast'

export default function ExamForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(id)

  const [formData, setFormData] = useState<ExamFormData>({
    titre: '',
    description: '',
    duree_minutes: 30,
    tentatives_max: 1,
    melange_questions: false,
    melange_reponses: false,
    date_debut: '',
    date_fin: '',
  })

  const [questions, setQuestions] = useState<QuestionFormData[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [selectedGroups, setSelectedGroups] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const questionImportRef = useRef<HTMLInputElement | null>(null)

  // Modal pour les questions
  const [questionModal, setQuestionModal] = useState<{
    isOpen: boolean
    question: QuestionFormData | null
    index: number | null
  }>({ isOpen: false, question: null, index: null })

  useEffect(() => {
    loadGroups()
    if (isEditing && id) {
      loadExam(id)
    }
  }, [id])

  const loadExam = async (examId: string) => {
    setIsLoading(true)
    try {
      const { exam } = await examService.getById(examId)
      setFormData({
        titre: exam.titre,
        description: exam.description || '',
        duree_minutes: exam.duree_minutes,
        tentatives_max: exam.tentatives_max,
        melange_questions: exam.melange_questions,
        date_debut: exam.date_debut ? new Date(exam.date_debut).toISOString().slice(0, 16) : '',
        date_fin:   exam.date_fin   ? new Date(exam.date_fin).toISOString().slice(0, 16)   : '',
        melange_reponses: exam.melange_reponses,
        code_acces: exam.code_acces || null,
      })
      setSelectedGroups(exam.groups?.map(g => g.id) || [])

      // Charger les questions
      const { questions: examQuestions } = await examService.getQuestions(examId)
      setQuestions(examQuestions.map(q => ({
        enonce: q.enonce,
        explication: q.explication ?? null,
        type: q.type as QuestionType,
        points: q.points,
        ordre: q.ordre,
        answers: q.answers?.map(a => ({
          id: a.id,
          texte: a.texte,
          image_url: a.image_url ?? null,
          est_correcte: a.est_correcte,
          ordre: a.ordre,
        })) || [],
      })))
    } catch (error) {
      toast.error('Erreur lors du chargement de l\'examen')
      navigate('/admin/exams')
    } finally {
      setIsLoading(false)
    }
  }

  const loadGroups = async () => {
    try {
      const { groups } = await studentService.getAllGroups()
      setGroups(groups)
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    const toISO = (val: string | undefined) => val ? new Date(val).toISOString() : undefined

    try {
      const payload = {
        ...formData,
        date_debut: toISO(formData.date_debut),
        date_fin:   toISO(formData.date_fin),
        groupIds: selectedGroups,
      }
      if (isEditing && id) {
        await examService.update(id, payload)
        toast.success('Examen mis à jour')
      } else {
        const { exam: newExam } = await examService.create(payload)
        for (let i = 0; i < questions.length; i++) {
          await examService.createQuestion({ ...questions[i], examId: newExam.id })
        }
        // Déclenche la notification email (l'examen a maintenant ses questions)
        if (questions.length > 0) {
          examService.update(newExam.id, payload).catch(() => {})
        }
        toast.success('Examen créé')
      }
      navigate('/admin/exams')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erreur lors de l\'enregistrement')
    } finally {
      setIsSaving(false)
    }
  }

  const openQuestionModal = (index: number | null = null) => {
    const newQuestion: QuestionFormData = {
      enonce: '',
      explication: null,
      type: 'SINGLE',
      points: 1,
      ordre: questions.length + 1,
      answers: [
        { texte: '', est_correcte: false, ordre: 1, image_url: null },
        { texte: '', est_correcte: false, ordre: 2, image_url: null },
      ],
    }
    setQuestionModal({
      isOpen: true,
      question: newQuestion,
      index,
    })
  }

  const editQuestion = (index: number) => {
    setQuestionModal({
      isOpen: true,
      question: { ...questions[index] },
      index,
    })
  }

  const saveQuestion = () => {
    if (!questionModal.question) return

    // Validation
    if (!questionModal.question.enonce.trim()) {
      toast.error('L\'énoncé est requis')
      return
    }
    if (questionModal.question.answers.some(a => !a.texte.trim())) {
      toast.error('Toutes les réponses doivent avoir un texte')
      return
    }
    if (!questionModal.question.answers.some(a => a.est_correcte)) {
      toast.error('Au moins une réponse correcte est requise')
      return
    }

    if (questionModal.index !== null) {
      setQuestions(questions.map((q, i) => i === questionModal.index ? questionModal.question! : q))
    } else {
      setQuestions([...questions, { ...questionModal.question, ordre: questions.length + 1 }])
    }

    setQuestionModal({ isOpen: false, question: null, index: null })
  }

  const deleteQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index))
  }

  const handleGroupToggle = (groupId: string) => {
    setSelectedGroups(prev => prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    )
  }

  const handleAnswerImageUpload = async (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const { url } = await examService.uploadImage(file)
      const newAnswers = [...(questionModal.question?.answers || [])]
      newAnswers[index] = { ...newAnswers[index], image_url: url }
      setQuestionModal({ ...questionModal, question: { ...questionModal.question!, answers: newAnswers } })
      toast.success('Image uploadée')
    } catch {
      toast.error('Erreur lors de l\'upload')
    }
  }

  const removeAnswerImage = (index: number) => {
    const newAnswers = [...(questionModal.question?.answers || [])]
    newAnswers[index] = { ...newAnswers[index], image_url: null }
    setQuestionModal({ ...questionModal, question: { ...questionModal.question!, answers: newAnswers } })
  }

  const splitCsvLine = (line: string) => {
    const cells: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      const next = line[i + 1]

      if (char === '"') {
        if (inQuotes && next === '"') {
          current += '"'
          i += 1
        } else {
          inQuotes = !inQuotes
        }
        continue
      }

      if ((char === ';' || char === ',') && !inQuotes) {
        cells.push(current.trim())
        current = ''
        continue
      }

      current += char
    }

    cells.push(current.trim())
    return cells
  }

  const normalizeImportedQuestions = (list: any[]) => {
    return list.map((item: any, index: number) => {
      const answers = Array.isArray(item.answers) ? item.answers : []
      const normalizedAnswers = answers.map((answer: any, answerIndex: number) => ({
        id: answer.id,
        texte: String(answer.texte ?? '').trim(),
        image_url: answer.image_url ?? null,
        est_correcte: Boolean(answer.est_correcte),
        ordre: Number(answer.ordre) || answerIndex + 1,
      }))

      if (!String(item.enonce ?? '').trim()) {
        throw new Error(`Question ${index + 1}: l'énoncé est vide`)
      }
      if (normalizedAnswers.length === 0) {
        throw new Error(`Question ${index + 1}: aucune réponse fournie`)
      }
      if (!normalizedAnswers.some((a: { est_correcte: boolean }) => a.est_correcte)) {
        throw new Error(`Question ${index + 1}: au moins une bonne réponse est requise`)
      }

      return {
        enonce: String(item.enonce).trim(),
        type: (['SINGLE', 'MULTIPLE', 'TRUE_FALSE'].includes(item.type) ? item.type : 'SINGLE') as QuestionType,
        points: Number(item.points) > 0 ? Number(item.points) : 1,
        ordre: Number(item.ordre) > 0 ? Number(item.ordre) : questions.length + index + 1,
        answers: normalizedAnswers,
      }
    })
  }

  const parseCsvQuestions = (text: string) => {
    const lines = text
      .replace(/^\uFEFF/, '')
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(Boolean)

    if (lines.length === 0) {
      throw new Error('Le fichier CSV est vide')
    }

    const headers = splitCsvLine(lines[0]).map(header => header.toLowerCase())
    const hasHeader = headers.includes('enonce') || headers.includes('question') || headers.includes('answers') || headers.includes('réponses')
    const dataLines = hasHeader ? lines.slice(1) : lines

    return dataLines.map((line, index) => {
      const values = splitCsvLine(line)

      if (hasHeader) {
        const row: Record<string, string> = {}
        headers.forEach((header, headerIndex) => {
          row[header] = values[headerIndex] ?? ''
        })
        return row
      }

      return {
        enonce: values[0] ?? '',
        type: values[1] ?? '',
        points: values[2] ?? '',
        ordre: values[3] ?? '',
        answers: values[4] ?? '',
        _row: String(index + 1),
      }
    })
  }

  const parseCsvAnswers = (value: string, questionIndex: number) => {
    const answers = value
      .split('|')
      .map(answer => answer.trim())
      .filter(Boolean)
      .map((answer, answerIndex) => {
        const starMarked = /\*$/.test(answer)
        const normalized = answer.replace(/\*$/, '')
        const [textePart, markerPart] = normalized.split(/:(.+)/)
        const marker = (markerPart ?? '').trim().toLowerCase()

        return {
          texte: textePart.trim(),
          image_url: null,
          est_correcte: starMarked || marker === '1' || marker === 'true' || marker === 'yes' || marker === 'correct',
          ordre: answerIndex + 1,
        }
      })

    if (answers.length === 0) {
      throw new Error(`Question ${questionIndex}: aucune réponse trouvée`)
    }
    if (answers.some(answer => !answer.texte)) {
      throw new Error(`Question ${questionIndex}: une réponse est vide`)
    }
    if (!answers.some(answer => answer.est_correcte)) {
      throw new Error(`Question ${questionIndex}: au moins une bonne réponse est requise`)
    }

    return answers
  }

  const parseExcelRows = (rows: any[]): any[] => rows

  const handleQuestionsImport = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const fileName = file.name.toLowerCase()
      const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls')
      const isCsv = fileName.endsWith('.csv') || file.type.includes('csv')
      let imported: QuestionFormData[] = []

      if (isExcel) {
        const buffer = await file.arrayBuffer()
        const workbook = XLSX.read(buffer, { type: 'array' })
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json<any>(sheet, { defval: '' })

        if (rows.length === 0) throw new Error('Le fichier Excel est vide')

        imported = parseExcelRows(rows).map((row: any, index: number) => ({
          enonce: String(row.enonce ?? row.question ?? row.Enonce ?? row.Question ?? '').trim(),
          type: (['SINGLE', 'MULTIPLE', 'TRUE_FALSE'].includes(String(row.type ?? row.Type ?? '').trim().toUpperCase())
            ? String(row.type ?? row.Type ?? '').trim().toUpperCase()
            : 'SINGLE') as QuestionType,
          points: Number(row.points ?? row.Points ?? row.point ?? 0) > 0
            ? Number(row.points ?? row.Points ?? row.point)
            : 1,
          ordre: Number(row.ordre ?? row.Ordre ?? row.order ?? 0) > 0
            ? Number(row.ordre ?? row.Ordre ?? row.order)
            : questions.length + index + 1,
          answers: parseCsvAnswers(
            String(row.answers ?? row.reponses ?? row['réponses'] ?? row.Reponses ?? row.Answers ?? ''),
            index + 1,
          ),
        }))
      } else if (isCsv) {
        const text = await file.text()
        const rows = parseCsvQuestions(text)
        imported = rows.map((row: any, index: number) => ({
          enonce: String(row.enonce ?? row.question ?? '').trim(),
          type: (['SINGLE', 'MULTIPLE', 'TRUE_FALSE'].includes(String(row.type ?? '').trim().toUpperCase())
            ? String(row.type ?? '').trim().toUpperCase()
            : 'SINGLE') as QuestionType,
          points: Number(row.points ?? row.point) > 0 ? Number(row.points ?? row.point) : 1,
          ordre: Number(row.ordre ?? row.order) > 0 ? Number(row.ordre ?? row.order) : questions.length + index + 1,
          answers: parseCsvAnswers(String(row.answers ?? row.reponses ?? row['réponses'] ?? ''), index + 1),
        }))
      } else {
        const text = await file.text()
        const raw = JSON.parse(text)
        const list = Array.isArray(raw) ? raw : Array.isArray(raw.questions) ? raw.questions : null

        if (!list) {
          throw new Error('Le fichier doit contenir un tableau de questions ou un objet { questions: [] }')
        }

        imported = normalizeImportedQuestions(list)
      }

      setQuestions(prev => [...prev, ...imported.map((q, idx) => ({ ...q, ordre: prev.length + idx + 1 }))])
      toast.success(`${imported.length} question(s) importée(s)`)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur lors de l\'import'
      toast.error(message)
    } finally {
      if (questionImportRef.current) questionImportRef.current.value = ''
    }
  }
  if (isLoading) {
    return (
      <div className="space-y-6"> <div className="h-8 w-48 animate-pulse bg-slate-200 dark:bg-slate-700 rounded-xl"></div> <div className="animate-pulse bg-slate-200 dark:bg-slate-700 rounded-2xl h-96"></div> </div> )
  }

  return (
    <div className="space-y-6">
      <input
        ref={questionImportRef}
        type="file"
        accept=".json,.csv,.xlsx,.xls,application/json,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
        className="hidden"
        onChange={handleQuestionsImport}
      />
      <form onSubmit={handleSubmit}> {/* En-tête */}
        <div className="flex items-center justify-between mb-6"> <div> <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white"> {isEditing ? 'Modifier l\'examen' : 'Nouvel examen'}
            </h1> <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5"> {isEditing ? 'Modifiez les informations de l\'examen' : 'Créez un nouvel examen pour vos étudiants'}
            </p> </div> <div className="flex space-x-3"> <Button type="button" variant="outline" onClick={() => navigate('/admin/exams')}> Annuler
            </Button> <Button type="submit" isLoading={isSaving}> {isEditing ? 'Enregistrer' : 'Créer l\'examen'}
            </Button> </div> </div> {/* Informations de l'examen */}
        <Card title="Informations générales"> <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> <Input
              label="Titre"
              value={formData.titre}
              onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
              placeholder="Titre de l'examen"
              required
            /> <Input
              label="Durée (minutes)"
              type="number"
              value={formData.duree_minutes}
              onChange={(e) => setFormData({ ...formData, duree_minutes: parseInt(e.target.value) || 60 })}
              min={1}
              max={180}
            /> <Input
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Description de l'examen"
              className="md:col-span-2"
            /> <Input
              label="Tentatives maximum"
              type="number"
              value={formData.tentatives_max}
              onChange={(e) => setFormData({ ...formData, tentatives_max: parseInt(e.target.value) || 1 })}
              min={1}
              max={10}
            /> <div className="flex items-center space-x-6"> <label className="flex items-center cursor-pointer group"> <input
                  type="checkbox"
                  checked={formData.melange_questions}
                  onChange={(e) => setFormData({ ...formData, melange_questions: e.target.checked })}
                  className="rounded border-slate-300 dark:border-slate-600 accent-indigo-600 w-4 h-4"
                /> <span className="ml-2 text-sm text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors"> Mélanger les questions
                </span> </label> <label className="flex items-center cursor-pointer group"> <input
                  type="checkbox"
                  checked={formData.melange_reponses}
                  onChange={(e) => setFormData({ ...formData, melange_reponses: e.target.checked })}
                  className="rounded border-slate-300 dark:border-slate-600 accent-indigo-600 w-4 h-4"
                /> <span className="ml-2 text-sm text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors"> Mélanger les réponses
                </span> </label> </div>

            {/* Planification */}
            <div className="md:col-span-2 rounded-2xl border border-primary-200 dark:border-primary-800/40 bg-primary-50 dark:bg-primary-900/10 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
                <span className="text-sm font-semibold text-primary-700 dark:text-primary-300">Planification (optionnel)</span>
              </div>
              <p className="text-xs text-primary-600 dark:text-primary-400">Si non renseigné, l'examen est disponible immédiatement pour les classes assignées.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Disponible à partir de
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.date_debut || ''}
                    onChange={e => setFormData({ ...formData, date_debut: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Disponible jusqu'à
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.date_fin || ''}
                    onChange={e => setFormData({ ...formData, date_fin: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                  />
                </div>
              </div>
              {(formData.date_debut || formData.date_fin) && (
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, date_debut: '', date_fin: '' })}
                  className="text-xs text-slate-400 hover:text-danger-500 transition-colors"
                >
                  Effacer les dates
                </button>
              )}
            </div>

          {/* Code d'accès */}
          <div className="mt-4 rounded-2xl border border-warning-200 dark:border-warning-800/40 bg-warning-50 dark:bg-warning-900/10 p-4 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-warning-600 dark:text-warning-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                </svg>
                <span className="text-sm font-semibold text-warning-700 dark:text-warning-300">Code d'accès (optionnel)</span>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!formData.code_acces}
                  onChange={e => setFormData({ ...formData, code_acces: e.target.checked ? Array.from({length:6}, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random()*32)]).join('') : null })}
                  className="rounded border-slate-300 dark:border-slate-600 accent-indigo-600 w-4 h-4"
                />
                <span className="text-sm text-warning-700 dark:text-warning-300">Activer</span>
              </label>
            </div>
            {formData.code_acces && (
              <>
                <p className="text-xs text-warning-600 dark:text-warning-400">Communiquez ce code aux étudiants avant l'examen. Ils devront le saisir pour accéder.</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-3 bg-white dark:bg-slate-900 rounded-xl border border-warning-300 dark:border-warning-700 px-4 py-2.5">
                    <span className="text-2xl font-mono font-bold tracking-[0.3em] text-slate-900 dark:text-white">{formData.code_acces}</span>
                  </div>
                  <button type="button" title="Copier" onClick={() => { navigator.clipboard.writeText(formData.code_acces!); alert('Code copié !') }}
                    className="flex items-center justify-center h-10 w-10 rounded-xl bg-warning-100 dark:bg-warning-900/30 text-warning-700 dark:text-warning-400 hover:bg-warning-200 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" /></svg>
                  </button>
                  <button type="button" title="Régénérer" onClick={() => setFormData({ ...formData, code_acces: Array.from({length:6}, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random()*32)]).join('') })}
                    className="flex items-center justify-center h-10 w-10 rounded-xl bg-warning-100 dark:bg-warning-900/30 text-warning-700 dark:text-warning-400 hover:bg-warning-200 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
                  </button>
                </div>
              </>
            )}
          </div>

          </div> {/* Groupes */}
          {groups.length > 0 && (
            <div className="mt-6"> <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"> Classes d'étudiants <span className="text-slate-400 dark:text-slate-500 font-normal">(optionnel)</span> </label> <div className="flex flex-wrap gap-2"> {groups.map((group) => (
                  <button
                    key={group.id}
                    type="button"
                    onClick={() => handleGroupToggle(group.id)}
                    className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 border-2 ${
                      selectedGroups.includes(group.id)
                        ? 'bg-primary-100 text-primary-700 border-primary-500 dark:bg-primary-900/40 dark:text-primary-300 dark:border-primary-500'
                        : 'bg-slate-100 text-slate-700 border-transparent hover:border-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:border-slate-500'
                    }`}
                  > {group.nom}
                  </button> ))}
              </div> </div> )}
        </Card> {/* Questions */}
        <Card
          title="Questions"
          action={
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => questionImportRef.current?.click()}>
                Importer CSV / JSON
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => openQuestionModal()}> + Ajouter une question
              </Button>
            </div>
          }
        >
          <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600 dark:border-slate-700/60 dark:bg-slate-800/50 dark:text-slate-300">
            CSV attendu: <span className="font-medium">enonce,type,points,ordre,answers</span>. Les réponses se séparent avec <span className="font-medium">|</span> et une bonne réponse peut être marquée par <span className="font-medium">*</span> ou <span className="font-medium">:1</span>.
          </div>
          {questions.length === 0 ? (
            <div className="text-center py-10"> <svg className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> </svg> <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Aucune question ajoutée</p> <Button type="button" variant="ghost" onClick={() => openQuestionModal()} className="mt-2"> Ajouter une question
              </Button> </div> ) : (
            <div className="space-y-3"> {questions.map((question, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl transition-colors"
                > <div className="flex-1 min-w-0"> <div className="flex items-center space-x-2 flex-wrap gap-y-1"> <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Q{index + 1}</span> <span className="px-2 py-0.5 text-xs rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"> {question.type}
                      </span> <span className="text-xs text-slate-400 dark:text-slate-500">{question.points} pt(s)</span> </div> <p className="mt-1 font-medium text-slate-900 dark:text-white truncate">{question.enonce}</p> <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500"> {question.answers.filter(a => a.est_correcte).length} réponse(s) correcte(s) sur {question.answers.length}
                    </p> </div> <div className="flex space-x-1 ml-3 flex-shrink-0"> <Button type="button" variant="ghost" size="sm" onClick={() => editQuestion(index)}> Modifier
                    </Button> <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteQuestion(index)}
                      className="text-danger-600 dark:text-danger-400 hover:text-danger-700 dark:hover:text-danger-300"
                    > Supprimer
                    </Button> </div> </div> ))}
            </div> )}
        </Card> </form> {/* Modal de question */}
      <Modal
        isOpen={questionModal.isOpen}
        onClose={() => setQuestionModal({ isOpen: false, question: null, index: null })}
        title={questionModal.index !== null ? 'Modifier la question' : 'Nouvelle question'}
        size="lg"
      > <div className="space-y-4"> <Input
            label="Énoncé de la question"
            value={questionModal.question?.enonce || ''}
            onChange={(e) => setQuestionModal({
              ...questionModal,
              question: { ...questionModal.question!, enonce: e.target.value }
            })}
            placeholder="Entrez l'énoncé de la question"
          /> <div className="grid grid-cols-2 gap-4"> <div> <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Type</label> <select
                value={questionModal.question?.type || 'SINGLE'}
                onChange={(e) => setQuestionModal({
                  ...questionModal,
                  question: { ...questionModal.question!, type: e.target.value as QuestionType }
                })}
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 transition-colors"
              > <option value="SINGLE">Choix unique</option> <option value="MULTIPLE">Choix multiple</option> <option value="TRUE_FALSE">Vrai/Faux</option> </select> </div> <Input
              label="Points"
              type="number"
              value={questionModal.question?.points || 1}
              onChange={(e) => setQuestionModal({
                ...questionModal,
                question: { ...questionModal.question!, points: parseInt(e.target.value) || 1 }
              })}
              min={1}
              max={10}
            /> </div> <div> <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Explication <span className="text-xs font-normal text-slate-400">(optionnel — visible après résultats)</span></label> <textarea
              rows={2}
              value={questionModal.question?.explication || ''}
              onChange={(e) => setQuestionModal({
                ...questionModal,
                question: { ...questionModal.question!, explication: e.target.value || null }
              })}
              placeholder="Expliquez pourquoi cette réponse est correcte…"
              className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 transition-colors resize-none"
            /> </div> <div> <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Réponses</label> <div className="space-y-3"> {questionModal.question?.answers.map((answer, index) => (
                <div key={index} className="flex items-start gap-2"> <input
                    type="checkbox"
                    checked={answer.est_correcte}
                    onChange={(e) => {
                      const newAnswers = [...(questionModal.question?.answers || [])]
                      newAnswers[index] = { ...newAnswers[index], est_correcte: e.target.checked }
                      setQuestionModal({
                        ...questionModal,
                        question: { ...questionModal.question!, answers: newAnswers }
                      })
                    }}
                    className="rounded border-slate-300 dark:border-slate-600 accent-indigo-600 w-4 h-4 flex-shrink-0 mt-2.5"
                  /> <div className="flex-1 space-y-2"> <Input
                      value={answer.texte}
                      onChange={(e) => {
                        const newAnswers = [...(questionModal.question?.answers || [])]
                        newAnswers[index] = { ...newAnswers[index], texte: e.target.value }
                        setQuestionModal({
                          ...questionModal,
                          question: { ...questionModal.question!, answers: newAnswers }
                        })
                      }}
                      placeholder={`Réponse ${index + 1}`}
                    /> {/* Section image */}
                    <div className="flex items-center gap-2"> {answer.image_url ? (
                        <div className="relative inline-block"> <img
                            src={resolveMediaUrl(answer.image_url)}
                            alt=""
                            className="h-16 w-auto rounded-lg border border-slate-200 dark:border-slate-700 object-contain"
                          /> <button
                            type="button"
                            onClick={() => removeAnswerImage(index)}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-danger-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-danger-600 transition-colors"
                          > ×
                          </button> </div> ) : (
                        <label className="cursor-pointer flex items-center gap-1.5 px-2 py-1 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"> <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}> <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /> </svg> Ajouter image
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleAnswerImageUpload(index, e)}
                          /> </label> )}
                    </div> </div> {(questionModal.question?.answers.length || 0) > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newAnswers = (questionModal.question?.answers || []).filter((_, i) => i !== index)
                        setQuestionModal({
                          ...questionModal,
                          question: { ...questionModal.question!, answers: newAnswers }
                        })
                      }}
                      className="text-slate-400 dark:text-slate-500 hover:text-danger-600 dark:hover:text-danger-400 flex-shrink-0 mt-1"
                    > ×
                    </Button> )}
                </div> ))}
            </div> <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                const newAnswers = [
                  ...(questionModal.question?.answers || []),
                  { texte: '', est_correcte: false, ordre: (questionModal.question?.answers.length || 0) + 1, image_url: null }
                ]
                setQuestionModal({
                  ...questionModal,
                  question: { ...questionModal.question!, answers: newAnswers }
                })
              }}
              className="mt-2"
            > + Ajouter une réponse
            </Button> </div> <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700/60"> <Button
              type="button"
              variant="outline"
              onClick={() => setQuestionModal({ isOpen: false, question: null, index: null })}
            > Annuler
            </Button> <Button type="button" onClick={saveQuestion}> Enregistrer
            </Button> </div> </div> </Modal> </div> )
}







