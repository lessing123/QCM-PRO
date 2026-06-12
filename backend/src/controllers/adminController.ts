import { Response } from 'express'
import { prisma } from '../config/db.js'
import { AuthRequest, asyncHandler } from '../middlewares/authMiddleware.js'
import { examIdParamSchema } from '../utils/validators.js'
import { buildTextPdf } from '../utils/pdf.js'

// Obtenir les résultats d'un examen
export const getExamResults = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { examId } = examIdParamSchema.parse(req.params)

  const exam = await prisma.exam.findUnique({ where: { id: examId } })
  if (!exam) {
    return res.status(404).json({ error: 'Examen non trouvé' })
  }

  const attempts = await prisma.attempt.findMany({
    where: { examId, statut: 'TERMINE' },
    include: {
      user: { select: { id: true, nom: true, prenom: true, email: true, groups: { select: { id: true, nom: true } } } },
    },
    orderBy: { date_fin: 'desc' },
  })

  const scores = attempts.map(a => a.score || 0)
  const stats = {
    total: attempts.length,
    moyenne: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0,
    min: scores.length > 0 ? Math.min(...scores) : 0,
    max: scores.length > 0 ? Math.max(...scores) : 0,
  }

  res.json({ attempts, stats, exam: { id: exam.id, titre: exam.titre, resultats_publics: exam.resultats_publics } })
})

// Statistiques détaillées par question
export const getExamStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { examId } = examIdParamSchema.parse(req.params)

  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: {
      questions: {
        orderBy: { ordre: 'asc' },
        include: { answers: { orderBy: { ordre: 'asc' } } },
      },
    },
  })

  if (!exam) {
    return res.status(404).json({ error: 'Examen non trouvé' })
  }

  const attempts = await prisma.attempt.findMany({
    where: { examId, statut: 'TERMINE' },
    select: { id: true, score: true },
  })

  const attemptIds = attempts.map(a => a.id)

  const questionStats = await Promise.all(
    exam.questions.map(async (question) => {
      const studentAnswers = await prisma.studentAnswer.findMany({
        where: { attemptId: { in: attemptIds }, questionId: question.id },
        include: { answer: true },
      })

      const correctAnswers = studentAnswers.filter(sa => sa.est_correcte === true)
      const totalAnswers = studentAnswers.length

      return {
        questionId: question.id,
        enonce: question.enonce,
        type: question.type,
        points: question.points,
        totalResponses: totalAnswers,
        correctCount: correctAnswers.length,
        successRate: totalAnswers > 0 ? (correctAnswers.length / totalAnswers) * 100 : 0,
        answers: question.answers.map(answer => {
          const answerCount = studentAnswers.filter(sa => sa.answerId === answer.id).length
          return {
            answerId: answer.id,
            texte: answer.texte,
            est_correcte: answer.est_correcte,
            count: answerCount,
            percentage: totalAnswers > 0 ? (answerCount / totalAnswers) * 100 : 0,
          }
        }),
      }
    })
  )

  const allScores = attempts.map(a => a.score || 0)
  const globalStats = {
    totalAttempts: attempts.length,
    averageScore: allScores.length > 0 ? allScores.reduce((a, b) => a + b, 0) / allScores.length : 0,
    minScore: allScores.length > 0 ? Math.min(...allScores) : 0,
    maxScore: allScores.length > 0 ? Math.max(...allScores) : 0,
  }

  res.json({ exam: { id: exam.id, titre: exam.titre }, globalStats, questionStats })
})

// Exporter les résultats en CSV
export const exportResults = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { examId } = examIdParamSchema.parse(req.params)

  const exam = await prisma.exam.findUnique({ where: { id: examId } })
  if (!exam) {
    return res.status(404).json({ error: 'Examen non trouvé' })
  }

  const attempts = await prisma.attempt.findMany({
    where: { examId, statut: 'TERMINE' },
    include: { user: { select: { nom: true, prenom: true, email: true, groups: { select: { nom: true } } } } },
  })

  attempts.sort((a, b) => {
    const ca = a.user.groups.map(g => g.nom).join(', ') || ''
    const cb = b.user.groups.map(g => g.nom).join(', ') || ''
    const cc = ca.localeCompare(cb)
    if (cc !== 0) return cc
    return `${a.user.nom} ${a.user.prenom}`.localeCompare(`${b.user.nom} ${b.user.prenom}`)
  })

  const headers = ['Classe', 'Nom', 'Prénom', 'Email', 'Score /20', 'Date de début', 'Date de fin']
  const rows = attempts.map(attempt => [
    attempt.user.groups.map(g => g.nom).join(', ') || '—',
    attempt.user.nom,
    attempt.user.prenom,
    attempt.user.email,
    attempt.score?.toFixed(1) || '0',
    attempt.date_debut.toISOString(),
    attempt.date_fin?.toISOString() || '',
  ])

  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n')

  res.setHeader('Content-Type', 'text/csv; charset=utf-8')
  res.setHeader('Content-Disposition', `attachment; filename="resultats_${exam.titre.replace(/[^a-z0-9]/gi, '_')}.csv"`)
  res.send('\ufeff' + csv)
})

// Exporter les résultats en PDF
export const exportResultsPdf = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { examId } = examIdParamSchema.parse(req.params)

  const exam = await prisma.exam.findUnique({ where: { id: examId } })
  if (!exam) {
    return res.status(404).json({ error: 'Examen non trouvé' })
  }

  const attempts = await prisma.attempt.findMany({
    where: { examId, statut: 'TERMINE' },
    include: { user: { select: { nom: true, prenom: true, email: true } } },
    orderBy: { date_fin: 'desc' },
  })

  const scores = attempts.map(a => a.score || 0)
  const average = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
  const lines = [
    `Examen: ${exam.titre}`,
    `Tentatives: ${attempts.length}`,
    `Moyenne: ${average.toFixed(1)}/20`,
    `Minimum: ${scores.length > 0 ? Math.min(...scores).toFixed(1) : '0.0'}/20`,
    `Maximum: ${scores.length > 0 ? Math.max(...scores).toFixed(1) : '0.0'}/20`,
    '',
    'Nom | Prenom | Email | Score /20 | Date debut | Date fin',
    ...attempts.map(attempt => [
      attempt.user.nom,
      attempt.user.prenom,
      attempt.user.email,
      (attempt.score || 0).toFixed(1),
      attempt.date_debut.toISOString(),
      attempt.date_fin?.toISOString() || '',
    ].join(' | ')),
  ]

  const pdf = buildTextPdf(`Resultats - ${exam.titre}`, lines)

  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename="resultats_${exam.titre.replace(/[^a-z0-9]/gi, '_')}.pdf"`)
  res.send(pdf)
})

// Surveillance en temps réel d'un examen
export const getExamLive = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { examId } = examIdParamSchema.parse(req.params)

  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: {
      groups: {
        include: {
          users: {
            where: { role: 'STUDENT' },
            select: { id: true, nom: true, prenom: true, email: true, is_online: true },
          },
        },
      },
    },
  })
  if (!exam) return res.status(404).json({ error: 'Examen non trouvé' })

  const attempts = await prisma.attempt.findMany({
    where: { examId },
    select: { userId: true, statut: true, bloque: true },
  })
  const attemptMap = new Map(attempts.map(a => [a.userId, a]))

  const groups = exam.groups.map(group => {
    const students = group.users.map(s => {
      const att = attemptMap.get(s.id)
      return { ...s, attempt_status: att?.statut || null, bloque: att?.bloque || false }
    })
    return {
      id: group.id,
      nom: group.nom,
      total: students.length,
      connected: students.filter(s => s.is_online).length,
      in_exam: students.filter(s => s.attempt_status === 'EN_COURS').length,
      finished: students.filter(s => s.attempt_status === 'TERMINE').length,
      students,
    }
  })

  res.json({ exam: { id: exam.id, titre: exam.titre }, groups })
})

// Statistiques globales du dashboard admin
export const getAdminStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  const examCount = await prisma.exam.count()
  const studentCount = await prisma.user.count({ where: { role: 'STUDENT' } })
  const attemptCount = await prisma.attempt.count()

  const completedAttempts = await prisma.attempt.findMany({
    where: { statut: 'TERMINE', score: { not: null } },
    select: { score: true },
  })

  const avgScore = completedAttempts.length > 0
    ? completedAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / completedAttempts.length
    : 0

  const recentExams = await prisma.exam.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      titre: true,
      createdAt: true,
      _count: { select: { attempts: true, questions: true } },
    },
  })

  const recentAttempts = await prisma.attempt.findMany({
    take: 10,
    where: { statut: 'TERMINE' },
    orderBy: { date_fin: 'desc' },
    include: {
      user: { select: { nom: true, prenom: true } },
      exam: { select: { titre: true } },
    },
  })

  const classes = await prisma.group.findMany({
    orderBy: { nom: 'asc' },
    select: {
      id: true,
      nom: true,
      description: true,
      _count: { select: { users: true, exams: true } },
      users: {
        select: {
          id: true,
          attempts: {
            where: { statut: 'TERMINE', score: { not: null } },
            select: { score: true },
          },
        },
      },
    },
  })

  const classAverages = classes.map(classItem => {
    const scores = classItem.users.flatMap(user => user.attempts.map(attempt => attempt.score || 0))
    const averageScore = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0
    return {
      id: classItem.id,
      nom: classItem.nom,
      description: classItem.description,
      students: classItem._count.users,
      exams: classItem._count.exams,
      attempts: scores.length,
      averageScore: Math.round(averageScore * 10) / 10,
    }
  })

  res.json({
    examCount,
    studentCount,
    attemptCount,
    avgScore: Math.round(avgScore * 10) / 10,
    recentExams,
    recentAttempts,
    classAverages,
  })
})
