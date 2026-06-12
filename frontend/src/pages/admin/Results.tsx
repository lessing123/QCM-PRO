import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { examService } from '../../services/examService'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import { ExamResults } from '../../types'
import toast from 'react-hot-toast'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

export default function Results() {
  const { examId } = useParams()
  const [results, setResults] = useState<ExamResults | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sortField, setSortField] = useState<'nom' | 'score' | 'date' | 'classe'>('classe')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  useEffect(() => { if (examId) loadResults() }, [examId])

  const loadResults = async () => {
    try {
      const data = await examService.getResults(examId!)
      setResults(data)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      const blob = await examService.exportResults(examId!)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `resultats_${results?.exam.titre}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
      toast.success('Export réussi')
    } catch {
      toast.error("Erreur lors de l'export")
    }
  }

  const handleExportWord = async () => {
    if (!results) return
    try {
      const { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, HeadingLevel, WidthType, AlignmentType } = await import('docx')

      const headerCell = (text: string) => new TableCell({
        shading: { fill: '6366F1' },
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text, bold: true, color: 'FFFFFF', size: 20 })],
        })],
      })

      const dataCell = (text: string, bold = false, color = '1E293B') => new TableCell({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text, bold, color, size: 20 })],
        })],
      })

      const emailCell = (text: string) => new TableCell({
        children: [new Paragraph({
          children: [new TextRun({ text, size: 18, color: '64748B' })],
        })],
      })

      const statsTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            tableHeader: true,
            children: ['Tentatives', 'Moyenne /20', 'Minimum /20', 'Maximum /20'].map(headerCell),
          }),
          new TableRow({
            children: [
              dataCell(String(results.stats.total)),
              dataCell(results.stats.moyenne.toFixed(2)),
              dataCell(String(results.stats.min)),
              dataCell(String(results.stats.max)),
            ],
          }),
        ],
      })

      const studentsTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            tableHeader: true,
            children: ['Classe', 'Nom', 'Prénom', 'Email', 'Score /20', 'Date de fin'].map(headerCell),
          }),
          ...sortedForExport.map(a => {
            const score = a.score != null ? a.score.toFixed(2) : '—'
            const passed = (a.score || 0) >= 10
            return new TableRow({
              children: [
                dataCell(getClasse(a)),
                dataCell(a.user?.nom || ''),
                dataCell(a.user?.prenom || ''),
                emailCell(a.user?.email || ''),
                dataCell(`${score}/20`, true, passed ? '16A34A' : 'DC2626'),
                dataCell(new Date(a.date_fin || a.date_debut).toLocaleString('fr-FR')),
              ],
            })
          }),
        ],
      })

      const doc = new Document({
        sections: [{
          children: [
            new Paragraph({ text: `Résultats : ${results.exam.titre}`, heading: HeadingLevel.HEADING_1 }),
            new Paragraph({
              children: [new TextRun({ text: `Généré le ${new Date().toLocaleString('fr-FR')}`, color: '64748B', size: 18 })],
            }),
            new Paragraph({}),
            new Paragraph({ text: 'Statistiques', heading: HeadingLevel.HEADING_2 }),
            statsTable,
            new Paragraph({}),
            new Paragraph({ text: 'Liste des étudiants', heading: HeadingLevel.HEADING_2 }),
            studentsTable,
          ],
        }],
      })

      const blob = await Packer.toBlob(doc)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `resultats_${results.exam.titre.replace(/[^a-z0-9]/gi, '_')}.docx`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Word généré')
    } catch (e) {
      console.error(e)
      toast.error("Erreur lors de l'export Word")
    }
  }

  const handleExportPdf = () => {
    if (!results) return
    try {
      const doc = new jsPDF()
      const primary: [number, number, number] = [99, 102, 241]

      // En-tête
      doc.setFontSize(18)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(30, 41, 59)
      doc.text(`Résultats : ${results.exam.titre}`, 14, 20)

      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(100, 116, 139)
      doc.text(`Généré le ${new Date().toLocaleString('fr-FR')}`, 14, 27)

      // Statistiques
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(30, 41, 59)
      doc.text('Statistiques', 14, 38)

      autoTable(doc, {
        startY: 42,
        head: [['Tentatives', 'Moyenne /20', 'Minimum /20', 'Maximum /20']],
        body: [[
          String(results.stats.total),
          results.stats.moyenne.toFixed(2),
          String(results.stats.min),
          String(results.stats.max),
        ]],
        theme: 'grid',
        headStyles: { fillColor: primary, textColor: 255, fontStyle: 'bold', fontSize: 9 },
        bodyStyles: { fontSize: 10, halign: 'center' },
        columnStyles: { 0: { halign: 'center' } },
      })

      const y1 = (doc as any).lastAutoTable?.finalY ?? 65

      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(30, 41, 59)
      doc.text('Liste des étudiants', 14, y1 + 12)

      autoTable(doc, {
        startY: y1 + 16,
        head: [['Classe', 'Nom', 'Prénom', 'Email', 'Score /20', 'Date de fin']],
        body: sortedForExport.map(a => [
          getClasse(a),
          a.user?.nom || '',
          a.user?.prenom || '',
          a.user?.email || '',
          a.score != null ? a.score.toFixed(2) : '—',
          new Date(a.date_fin || a.date_debut).toLocaleString('fr-FR'),
        ]),
        theme: 'striped',
        headStyles: { fillColor: primary, textColor: 255, fontStyle: 'bold', fontSize: 9 },
        bodyStyles: { fontSize: 9 },
        columnStyles: {
          0: { cellWidth: 28 },
          1: { cellWidth: 28 },
          2: { cellWidth: 28 },
          3: { cellWidth: 'auto' },
          4: { cellWidth: 20, halign: 'center' },
          5: { cellWidth: 30 },
        },
        didParseCell: (data) => {
          if (data.section === 'body' && data.column.index === 4) {
            const val = parseFloat(data.cell.text[0])
            if (!isNaN(val)) {
              data.cell.styles.textColor = val >= 10 ? [22, 163, 74] : [220, 38, 38]
              data.cell.styles.fontStyle = 'bold'
            }
          }
        },
      })

      doc.save(`resultats_${results.exam.titre.replace(/[^a-z0-9]/gi, '_')}.pdf`)
      toast.success('PDF généré')
    } catch {
      toast.error("Erreur lors de l'export PDF")
    }
  }

  const handleToggleResults = async () => {
    try {
      const { exam } = await examService.toggleResults(examId!)
      setResults(prev =>
        prev ? { ...prev, exam: { ...prev.exam, resultats_publics: exam.resultats_publics } } : prev
      )
      toast.success(exam.resultats_publics ? 'Notes publiées aux étudiants' : 'Notes masquées')
    } catch {
      toast.error('Erreur')
    }
  }

  const getClasse = (a: typeof results extends null ? never : NonNullable<typeof results>['attempts'][0]) =>
    a.user?.groups?.map(g => g.nom).join(', ') || '—'

  const handleSort = (field: 'nom' | 'score' | 'date' | 'classe') => {
    if (sortField === field) {
      setSortOrder(o => o === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const sorted = [...(results?.attempts || [])].sort((a, b) => {
    let cmp = 0
    if (sortField === 'nom')
      cmp = `${a.user?.nom} ${a.user?.prenom}`.localeCompare(`${b.user?.nom} ${b.user?.prenom}`)
    else if (sortField === 'score')
      cmp = (a.score || 0) - (b.score || 0)
    else if (sortField === 'classe') {
      cmp = getClasse(a).localeCompare(getClasse(b))
      if (cmp === 0) cmp = `${a.user?.nom} ${a.user?.prenom}`.localeCompare(`${b.user?.nom} ${b.user?.prenom}`)
    } else
      cmp = new Date(a.date_fin || a.date_debut).getTime() - new Date(b.date_fin || b.date_debut).getTime()
    return sortOrder === 'asc' ? cmp : -cmp
  })

  const sortedForExport = [...(results?.attempts || [])].sort((a, b) => {
    const classeA = getClasse(a)
    const classeB = getClasse(b)
    const cc = classeA.localeCompare(classeB)
    if (cc !== 0) return cc
    return `${a.user?.nom} ${a.user?.prenom}`.localeCompare(`${b.user?.nom} ${b.user?.prenom}`)
  })

  const SortBtn = ({ field, label }: { field: 'nom' | 'score' | 'date' | 'classe'; label: string }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
    >
      {label}
      <span className="opacity-50">{sortField === field ? (sortOrder === 'asc' ? '▲' : '▼') : '—'}</span>
    </button>
  )

  if (isLoading) return (
    <div className="space-y-6 animate-pulse">
      <div className="h-6 w-48 skeleton rounded-xl" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
      </div>
      <div className="skeleton h-80 rounded-2xl" />
    </div>
  )

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <Link
            to="/admin/exams"
            className="inline-flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors mb-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Retour aux examens
          </Link>
          <h1 className="page-title">Résultats : {results?.exam.titre}</h1>
          <p className="page-subtitle">{sorted.length} tentative{sorted.length !== 1 ? 's' : ''}</p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant={results?.exam.resultats_publics ? 'success' : 'outline'}
            onClick={handleToggleResults}
          >
            {results?.exam.resultats_publics
              ? (<><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg> Notes publiées</>)
              : 'Publier les notes'
            }
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Exporter CSV
          </Button>
          <Button variant="outline" onClick={handleExportPdf}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v3.375c0 .621-.504 1.125-1.125 1.125h-12.75A1.125 1.125 0 014.5 17.625V6.375c0-.621.504-1.125 1.125-1.125h4.125L12 7.5h6.375c.621 0 1.125.504 1.125 1.125V14.25z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 12h7.5m-7.5 3h5.25" />
            </svg>
            Exporter PDF
          </Button>
          <Button variant="outline" onClick={handleExportWord}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v3.375c0 .621-.504 1.125-1.125 1.125h-12.75A1.125 1.125 0 014.5 17.625V6.375c0-.621.504-1.125 1.125-1.125h4.125L12 7.5h6.375c.621 0 1.125.504 1.125 1.125V14.25z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
            </svg>
            Exporter Word
          </Button>
        </div>
      </div>

      {/* Avertissement notes non publiées */}
      {!results?.exam.resultats_publics && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-700/40">
          <svg className="w-4 h-4 text-warning-600 dark:text-warning-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <p className="text-sm text-warning-700 dark:text-warning-300">
            Les notes ne sont pas encore visibles par les étudiants.
          </p>
        </div>
      )}

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Tentatives', value: results?.stats.total || 0, suffix: '' },
          { label: 'Moyenne', value: results?.stats.moyenne.toFixed(1) || '0', suffix: '/20' },
          { label: 'Minimum', value: results?.stats.min || 0, suffix: '/20' },
          { label: 'Maximum', value: results?.stats.max || 0, suffix: '/20' },
        ].map(s => (
          <Card key={s.label} className="text-center">
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {s.value}<span className="text-base text-slate-400 dark:text-slate-500">{s.suffix}</span>
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Tableau */}
      <Card noPadding>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700/60">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="px-6 py-3 text-left"><SortBtn field="classe" label="Classe" /></th>
                <th className="px-6 py-3 text-left"><SortBtn field="nom" label="Étudiant" /></th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Email</th>
                <th className="px-6 py-3 text-left"><SortBtn field="score" label="Score" /></th>
                <th className="px-6 py-3 text-left"><SortBtn field="date" label="Date" /></th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700/60">
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-500 dark:text-slate-400">
                    Aucun résultat disponible
                  </td>
                </tr>
              ) : sorted.map(attempt => {
                const passed = (attempt.score || 0) >= 10
                return (
                  <tr key={attempt.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                      {getClasse(attempt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {attempt.user?.prenom} {attempt.user?.nom}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                      {attempt.user?.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`badge ${passed ? 'badge-success' : 'badge-danger'}`}>
                        {attempt.score?.toFixed(1)}/20
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                      {new Date(attempt.date_fin || attempt.date_debut).toLocaleString('fr-FR')}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
