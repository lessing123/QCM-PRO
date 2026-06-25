import { Response } from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { prisma } from '../config/db.js'
import { AuthRequest, asyncHandler } from '../middlewares/authMiddleware.js'
import { questionSchema, updateQuestionSchema, idParamSchema } from '../utils/validators.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const uploadDir = path.join(__dirname, '../../../public/uploads')

const deleteUploadFile = (imageUrl: string | null | undefined) => {
  if (!imageUrl) return
  try {
    const filename = imageUrl.split('/uploads/').pop()
    if (!filename) return
    const filePath = path.join(uploadDir, filename)
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
  } catch { /* ignore */ }
}

// Liste des questions d'un examen
export const getQuestionsByExam = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = idParamSchema.parse(req.params)

  const questions = await prisma.question.findMany({
    where: { examId: id },
    include: { answers: { orderBy: { ordre: 'asc' } } },
    orderBy: { ordre: 'asc' },
  })

  res.json({ questions })
})

// Obtenir une question par ID
export const getQuestionById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = idParamSchema.parse(req.params)

  const question = await prisma.question.findUnique({
    where: { id },
    include: {
      answers: { orderBy: { ordre: 'asc' } },
      exam: { select: { id: true, titre: true } },
    },
  })

  if (!question) {
    return res.status(404).json({ error: 'Question non trouvée' })
  }

  res.json({ question })
})

// Créer une question
export const createQuestion = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { examId, enonce, explication, type, points, ordre, answers } = questionSchema.parse(req.body)

  const exam = await prisma.exam.findUnique({ where: { id: examId } })
  if (!exam) {
    return res.status(404).json({ error: 'Examen non trouvé' })
  }

  const hasCorrectAnswer = answers.some(a => a.est_correcte)
  if (!hasCorrectAnswer) {
    return res.status(400).json({ error: 'Au moins une réponse correcte est requise' })
  }

  const question = await prisma.question.create({
    data: {
      examId,
      enonce,
      explication: explication ?? null,
      type,
      points,
      ordre,
      answers: { create: answers },
    },
    include: { answers: { orderBy: { ordre: 'asc' } } },
  })

  res.status(201).json({ message: 'Question créée avec succès', question })
})

// Mettre à jour une question
export const updateQuestion = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = idParamSchema.parse(req.params)
  const body = updateQuestionSchema.parse(req.body)

  const existingQuestion = await prisma.question.findUnique({ where: { id } })
  if (!existingQuestion) {
    return res.status(404).json({ error: 'Question non trouvée' })
  }

  if (body.answers) {
    const hasCorrectAnswer = body.answers.some(a => a.est_correcte)
    if (!hasCorrectAnswer) {
      return res.status(400).json({ error: 'Au moins une réponse correcte est requise' })
    }

    // Collecter les images des anciennes réponses avant suppression
    const oldAnswers = await prisma.answer.findMany({
      where: { questionId: id },
      select: { image_url: true },
    })

    await prisma.answer.deleteMany({ where: { questionId: id } })
    await prisma.answer.createMany({
      data: body.answers.map(a => ({
        questionId: id,
        texte: a.texte,
        est_correcte: a.est_correcte,
        ordre: a.ordre,
      })),
    })

    // Supprimer les fichiers images orphelins
    oldAnswers.forEach(a => deleteUploadFile(a.image_url))
  }

  const question = await prisma.question.update({
    where: { id },
    data: {
      enonce: body.enonce,
      explication: body.explication !== undefined ? (body.explication ?? null) : undefined,
      type: body.type,
      points: body.points,
      ordre: body.ordre,
    },
    include: { answers: { orderBy: { ordre: 'asc' } } },
  })

  res.json({ message: 'Question mise à jour avec succès', question })
})

// Supprimer une question
export const deleteQuestion = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = idParamSchema.parse(req.params)

  const existingQuestion = await prisma.question.findUnique({
    where: { id },
    include: { answers: { select: { image_url: true } } },
  })
  if (!existingQuestion) {
    return res.status(404).json({ error: 'Question non trouvée' })
  }

  await prisma.question.delete({ where: { id } })

  // Supprimer les fichiers images orphelins
  existingQuestion.answers.forEach(a => deleteUploadFile(a.image_url))

  res.json({ message: 'Question supprimée avec succès' })
})

// Réordonner les questions
export const reorderQuestions = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { questionIds } = req.body as { questionIds: string[] }

  if (!Array.isArray(questionIds) || questionIds.length === 0) {
    return res.status(400).json({ error: 'Liste des IDs de questions requise' })
  }

  for (let i = 0; i < questionIds.length; i++) {
    await prisma.question.update({
      where: { id: questionIds[i] },
      data: { ordre: i + 1 },
    })
  }

  res.json({ message: 'Questions réordonnées avec succès' })
})
