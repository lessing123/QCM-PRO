import { Response } from 'express'
import { prisma } from '../config/db.js'
import { AuthRequest, asyncHandler } from '../middlewares/authMiddleware.js'
import { submitAnswerSchema, idParamSchema } from '../utils/validators.js'

function accessibleExamWhere(userId: string) {
  const now = new Date()
  return {
    AND: [
      { groups: { some: { users: { some: { id: userId } } } } },
      { OR: [{ date_debut: null }, { date_debut: { lte: now } }] },
      { OR: [{ date_fin: null }, { date_fin: { gte: now } }] },
    ],
  }
}

function sanitizeQuestions(questions: any[]) {
  return questions.map(q => ({
    ...q,
    answers: q.answers.map((a: any) => ({
      id: a.id,
      texte: a.texte,
      image_url: a.image_url,
      ordre: a.ordre,
    })),
  }))
}

// ── EXAMENS DISPONIBLES ───────────────────────────────────────────────────────

export const getAvailableExams = asyncHandler(async (req: AuthRequest, res: Response) => {
  const exams = await prisma.exam.findMany({
    where: accessibleExamWhere(req.user!.id),
    include: {
      createdBy: { select: { nom: true, prenom: true } },
      _count: { select: { questions: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const examsWithAttempts = await Promise.all(exams.map(async (exam) => {
    const attemptCount = await prisma.attempt.count({
      where: { userId: req.user!.id, examId: exam.id, statut: 'TERMINE' },
    })
    const currentAttempt = await prisma.attempt.findFirst({
      where: { userId: req.user!.id, examId: exam.id, statut: 'EN_COURS' },
      orderBy: { date_debut: 'desc' },
    })
    const { code_acces, ...examSafe } = exam as any
    return {
      ...examSafe,
      requires_code: !!code_acces,
      attemptsCount: attemptCount,
      maxAttempts: exam.tentatives_max,
      canTake: attemptCount < exam.tentatives_max,
      currentAttemptId: currentAttempt?.id || null,
    }
  }))

  res.json({ exams: examsWithAttempts })
})

// ── DÉTAILS D'UN EXAMEN ───────────────────────────────────────────────────────

export const getExamDetails = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = idParamSchema.parse(req.params)
  const exam = await prisma.exam.findFirst({
    where: { id, ...accessibleExamWhere(req.user!.id) },
    include: {
      createdBy: { select: { nom: true, prenom: true } },
      _count: { select: { questions: true } },
    },
  })
  if (!exam) return res.status(403).json({ error: 'Examen non disponible' })

  const attemptCount = await prisma.attempt.count({
    where: { userId: req.user!.id, examId: id, statut: 'TERMINE' },
  })
  const currentAttempt = await prisma.attempt.findFirst({
    where: { userId: req.user!.id, examId: id, statut: 'EN_COURS' },
    orderBy: { date_debut: 'desc' },
  })

  const { code_acces: _c, ...examSafe } = exam as any
  res.json({
    exam: {
      ...examSafe,
      requires_code: !!_c,
      attemptsCount: attemptCount,
      canTake: attemptCount < exam.tentatives_max,
      currentAttemptId: currentAttempt?.id || null,
    },
  })
})

// ── DÉMARRER UN EXAMEN ────────────────────────────────────────────────────────

export const startExam = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = idParamSchema.parse(req.params)
  const exam = await prisma.exam.findFirst({
    where: { id, ...accessibleExamWhere(req.user!.id) },
    include: {
      questions: {
        orderBy: { ordre: 'asc' },
        include: { answers: { orderBy: { ordre: 'asc' } } },
      },
    },
  })
  if (!exam) return res.status(403).json({ error: 'Examen non disponible' })

  // Vérification du code d'accès
  if ((exam as any).code_acces) {
    const provided = req.body?.code_acces
    if (!provided || provided.toUpperCase() !== (exam as any).code_acces) {
      return res.status(403).json({ error: 'Code d\'accès incorrect' })
    }
  }

  const attemptCount = await prisma.attempt.count({
    where: { userId: req.user!.id, examId: id, statut: 'TERMINE' },
  })
  if (attemptCount >= exam.tentatives_max) {
    return res.status(403).json({ error: 'Nombre maximum de tentatives atteint' })
  }

  const existingAttempt = await prisma.attempt.findFirst({
    where: { userId: req.user!.id, examId: id, statut: 'EN_COURS' },
    include: {
      studentAnswers: { select: { questionId: true, answerId: true } },
    },
  })

  if (existingAttempt) {
    return res.json({
      message: existingAttempt.bloque ? 'Examen bloqué' : 'Reprise de l\'examen',
      attempt: existingAttempt,
      exam: { ...exam, questions: sanitizeQuestions(exam.questions) },
    })
  }

  const attempt = await prisma.attempt.create({
    data: { userId: req.user!.id, examId: id, statut: 'EN_COURS' },
  })

  let questions = [...exam.questions]
  if (exam.melange_questions) questions = [...questions].sort(() => Math.random() - 0.5)
  if (exam.melange_reponses) questions = questions.map(q => ({ ...q, answers: [...q.answers].sort(() => Math.random() - 0.5) }))

  res.status(201).json({
    message: 'Examen démarré',
    attempt,
    exam: { ...exam, questions: sanitizeQuestions(questions) },
  })
})

// ── QUITTER (beacon fiable sur rechargement / fermeture) ─────────────────────

export const quitExam = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = idParamSchema.parse(req.params)
  // sendBeacon peut envoyer le token dans le body si le header Authorization est absent
  if (!req.user && req.body?.token) {
    try {
      const { verifyToken } = await import('../middlewares/authMiddleware.js')
      const payload = verifyToken(req.body.token)
      req.user = { id: payload.userId, email: payload.email, role: payload.role as 'ADMIN' | 'STUDENT' }
    } catch { return res.status(200).json({}) }
  }
  if (!req.user) return res.status(200).json({})

  const attempt = await prisma.attempt.findFirst({
    where: { id, userId: req.user!.id, statut: 'EN_COURS' },
    include: { exam: { select: { id: true, titre: true } } },
  })
  if (!attempt) return res.status(200).json({})

  await prisma.attempt.update({ where: { id }, data: { bloque: true } })

  const { io } = await import('../socket/socketServer.js')
  const message = `Rechargement/fermeture de page détecté pour "${attempt.exam.titre}"`
  const notif = await prisma.notification.create({
    data: { type: 'EXAM_QUIT', message, userId: req.user!.id, examId: attempt.exam.id },
    include: { user: { select: { nom: true, prenom: true } } },
  }).catch(() => null)

  if (notif) io?.to('admins').emit('notification:new', { ...notif, attemptId: id, canUnblock: true })

  res.status(200).json({})
})

// ── HISTORIQUE ───────────────────────────────────────────────────────────────

export const getMyAttempts = asyncHandler(async (req: AuthRequest, res: Response) => {
  const attempts = await prisma.attempt.findMany({
    where: { userId: req.user!.id },
    include: { exam: { select: { id: true, titre: true, duree_minutes: true, resultats_publics: true } } },
    orderBy: { date_debut: 'desc' },
  })
  res.json({ attempts })
})

export const getAttemptById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = idParamSchema.parse(req.params)
  const attempt = await prisma.attempt.findFirst({
    where: { id, userId: req.user!.id },
    include: {
      exam: {
        include: {
          questions: {
            orderBy: { ordre: 'asc' },
            include: { answers: { orderBy: { ordre: 'asc' } } },
          },
        },
      },
      studentAnswers: { include: { question: true, answer: true } },
    },
  })
  if (!attempt) return res.status(404).json({ error: 'Tentative non trouvée' })
  res.json({ attempt })
})

// ── SOUMETTRE UNE RÉPONSE ────────────────────────────────────────────────────

export const submitAnswer = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = idParamSchema.parse(req.params)
  const { questionId, answerId, answerIds } = submitAnswerSchema.parse(req.body)

  const attempt = await prisma.attempt.findFirst({ where: { id, userId: req.user!.id, statut: 'EN_COURS' } })
  if (!attempt) return res.status(404).json({ error: 'Tentative non trouvée ou terminée' })

  const question = await prisma.question.findFirst({ where: { id: questionId, examId: attempt.examId } })
  if (!question) return res.status(404).json({ error: 'Question non trouvée' })

  if (question.type === 'MULTIPLE') {
    await prisma.studentAnswer.deleteMany({ where: { attemptId: id, questionId } })

    const selectedIds = Array.from(new Set((answerIds || []).filter(Boolean)))
    if (selectedIds.length > 0) {
      const validAnswers = await prisma.answer.findMany({
        where: { questionId, id: { in: selectedIds } },
        select: { id: true },
      })

      if (validAnswers.length !== selectedIds.length) {
        return res.status(400).json({ error: 'Réponses invalides pour cette question' })
      }

      await prisma.studentAnswer.createMany({
        data: selectedIds.map(aid => ({ attemptId: id, questionId, answerId: aid })),
      })
    }
  } else {
    if (answerId) {
      const answer = await prisma.answer.findFirst({ where: { id: answerId, questionId } })
      if (!answer) return res.status(404).json({ error: 'Réponse non trouvée' })
    }
    const existing = await prisma.studentAnswer.findFirst({ where: { attemptId: id, questionId } })
    if (existing) {
      await prisma.studentAnswer.update({ where: { id: existing.id }, data: { answerId: answerId || null } })
    } else {
      await prisma.studentAnswer.create({ data: { attemptId: id, questionId, answerId: answerId || null } })
    }
  }

  res.json({ message: 'Réponse enregistrée' })
})

// ── TERMINER + CALCULER LE SCORE ─────────────────────────────────────────────

export const submitExam = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = idParamSchema.parse(req.params)

  const attempt = await prisma.attempt.findFirst({
    where: { id, userId: req.user!.id, statut: 'EN_COURS' },
    include: {
      exam: {
        include: {
          questions: {
            include: {
              answers: true,
            },
          },
        },
      },
      studentAnswers: true,
    },
  })
  if (!attempt) return res.status(404).json({ error: 'Tentative non trouvée ou déjà terminée' })

  let totalPoints = 0
  let earnedPoints = 0

  for (const question of attempt.exam.questions) {
    totalPoints += question.points

    const correctAnswerIds = new Set(question.answers.filter(a => a.est_correcte).map(a => a.id))

    if (question.type === 'MULTIPLE') {
      const studentAnswersForQ = attempt.studentAnswers.filter(sa => sa.questionId === question.id)
      const selectedIds = new Set(studentAnswersForQ.map(sa => sa.answerId).filter(Boolean) as string[])
      const isCorrect =
        selectedIds.size === correctAnswerIds.size &&
        [...selectedIds].every(answerId => correctAnswerIds.has(answerId))

      if (isCorrect) earnedPoints += question.points

      for (const sa of studentAnswersForQ) {
        await prisma.studentAnswer.update({
          where: { id: sa.id },
          data: { est_correcte: isCorrect },
        })
      }
    } else {
      const studentAnswer = attempt.studentAnswers.find(sa => sa.questionId === question.id)
      if (studentAnswer?.answerId) {
        const isCorrect = correctAnswerIds.has(studentAnswer.answerId)
        if (isCorrect) earnedPoints += question.points
        await prisma.studentAnswer.update({
          where: { id: studentAnswer.id },
          data: { est_correcte: isCorrect },
        })
      }
    }
  }

  const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 20 : 0

  const updatedAttempt = await prisma.attempt.update({
    where: { id },
    data: { statut: 'TERMINE', score, date_fin: new Date() },
    include: { exam: { select: { id: true, titre: true, resultats_publics: true } } },
  })

  // Notification admin : l'étudiant a terminé
  try {
    const student = await prisma.user.findUnique({ where: { id: req.user!.id }, select: { nom: true, prenom: true } })
    const name = student ? `${student.prenom} ${student.nom}` : 'Un étudiant'
    const { io } = await import('../socket/socketServer.js')
    const notif = await prisma.notification.create({
      data: { type: 'EXAM_SUBMITTED', message: `${name} a terminé l'examen "${updatedAttempt.exam.titre}"`, userId: req.user!.id, examId: updatedAttempt.exam.id },
      include: { user: { select: { nom: true, prenom: true } } },
    })
    io?.to('admins').emit('notification:new', { ...notif, attemptId: id, canUnblock: false })
  } catch { /* silencieux */ }

  res.json({
    message: 'Examen terminé',
    attempt: updatedAttempt,
    score: Math.round(score * 10) / 10,
    resultats_publics: updatedAttempt.exam.resultats_publics,
    details: { totalPoints, earnedPoints },
  })
})

// ── RÉSULTAT D'UNE TENTATIVE ────────────────────────────────────────────────

export const getExamResult = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = idParamSchema.parse(req.params)

  const attempt = await prisma.attempt.findFirst({
    where: { id, userId: req.user!.id, statut: 'TERMINE' },
    include: {
      exam: {
        include: {
          questions: {
            orderBy: { ordre: 'asc' },
            include: { answers: { orderBy: { ordre: 'asc' } } },
          },
        },
      },
      studentAnswers: { include: { question: true, answer: true } },
    },
  })
  if (!attempt) return res.status(404).json({ error: 'Résultat non trouvé' })

  const totalQuestions = attempt.exam.questions.length
  const resultatsPublics = attempt.exam.resultats_publics
  const correctQuestions = attempt.exam.questions.filter(q => {
    const sas = attempt.studentAnswers.filter(sa => sa.questionId === q.id)
    return sas.length > 0 && sas.every(sa => sa.est_correcte === true)
  }).length

  res.json({
    attempt: { ...attempt, score: resultatsPublics ? attempt.score : null },
    summary: {
      totalQuestions,
      correctAnswers: resultatsPublics ? correctQuestions : null,
      score: resultatsPublics ? attempt.score : null,
      resultats_publics: resultatsPublics,
    },
  })
})
