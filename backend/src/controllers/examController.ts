import { Response } from 'express'
import { prisma } from '../config/db.js'
import { AuthRequest, asyncHandler } from '../middlewares/authMiddleware.js'
import { examSchema, idParamSchema } from '../utils/validators.js'

// Liste de tous les examens (admin)
export const getAllExams = asyncHandler(async (req: AuthRequest, res: Response) => {
  const exams = await prisma.exam.findMany({
    include: {
      createdBy: { select: { id: true, nom: true, prenom: true } },
      _count: { select: { questions: true, attempts: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  res.json({ exams })
})

// Obtenir un examen par ID
export const getExamById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = idParamSchema.parse(req.params)

  const exam = await prisma.exam.findUnique({
    where: { id },
    include: {
      createdBy: { select: { id: true, nom: true, prenom: true } },
      questions: {
        orderBy: { ordre: 'asc' },
        include: { answers: { orderBy: { ordre: 'asc' } } },
      },
      groups: { select: { id: true, nom: true } },
    },
  })

  if (!exam) {
    return res.status(404).json({ error: 'Examen non trouvé' })
  }

  res.json({ exam })
})

function genCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

// Créer un examen
export const createExam = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { titre, description, duree_minutes, date_debut, date_fin, tentatives_max, melange_questions, melange_reponses, groupIds, code_acces } = examSchema.parse(req.body)

  const exam = await prisma.exam.create({
    data: {
      titre,
      description,
      duree_minutes,
      date_debut: date_debut ? new Date(date_debut) : null,
      date_fin: date_fin ? new Date(date_fin) : null,
      tentatives_max,
      melange_questions,
      melange_reponses,
      code_acces: code_acces === undefined ? null : (code_acces || genCode()),
      createdById: req.user!.id,
      groups: groupIds ? { connect: groupIds.map(id => ({ id })) } : undefined,
    },
    include: {
      createdBy: { select: { id: true, nom: true, prenom: true } },
    },
  })

  res.status(201).json({ message: 'Examen créé avec succès', exam })
})

// Mettre à jour un examen
export const updateExam = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = idParamSchema.parse(req.params)
  const { titre, description, duree_minutes, date_debut, date_fin, tentatives_max, melange_questions, melange_reponses, groupIds, code_acces } = examSchema.parse(req.body)

  const existingExam = await prisma.exam.findUnique({ where: { id } })
  if (!existingExam) {
    return res.status(404).json({ error: 'Examen non trouvé' })
  }

  const exam = await prisma.exam.update({
    where: { id },
    data: {
      titre,
      description,
      duree_minutes,
      date_debut: date_debut ? new Date(date_debut) : null,
      date_fin: date_fin ? new Date(date_fin) : null,
      tentatives_max,
      melange_questions,
      melange_reponses,
      code_acces: code_acces === undefined ? undefined : (code_acces || null),
      groups: groupIds ? { set: groupIds.map(gid => ({ id: gid })) } : undefined,
    },
    include: {
      createdBy: { select: { id: true, nom: true, prenom: true } },
    },
  })

  res.json({ message: 'Examen mis à jour avec succès', exam })
})

// Supprimer un examen
export const deleteExam = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = idParamSchema.parse(req.params)

  const existingExam = await prisma.exam.findUnique({ where: { id } })
  if (!existingExam) {
    return res.status(404).json({ error: 'Examen non trouvé' })
  }

  // Supprimer dans l'ordre pour respecter les contraintes FK
  await prisma.studentAnswer.deleteMany({ where: { attempt: { examId: id } } })
  await prisma.attempt.deleteMany({ where: { examId: id } })
  await prisma.exam.delete({ where: { id } })

  res.json({ message: 'Examen supprimé avec succès' })
})

// Publier / masquer les notes d'un examen
export const toggleResultsPublics = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = idParamSchema.parse(req.params)

  const exam = await prisma.exam.findUnique({ where: { id } })
  if (!exam) return res.status(404).json({ error: 'Examen non trouvé' })

  const updated = await prisma.exam.update({
    where: { id },
    data: { resultats_publics: !exam.resultats_publics },
    select: { id: true, titre: true, resultats_publics: true },
  })

  res.json({
    message: updated.resultats_publics ? 'Notes publiées' : 'Notes masquées',
    exam: updated,
  })
})

// Dupliquer un examen
export const duplicateExam = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = idParamSchema.parse(req.params)

  const originalExam = await prisma.exam.findUnique({
    where: { id },
    include: { questions: { include: { answers: true } } },
  })

  if (!originalExam) {
    return res.status(404).json({ error: 'Examen non trouvé' })
  }

  const newExam = await prisma.exam.create({
    data: {
      titre: `${originalExam.titre} (copie)`,
      description: originalExam.description,
      duree_minutes: originalExam.duree_minutes,
      tentatives_max: originalExam.tentatives_max,
      melange_questions: originalExam.melange_questions,
      melange_reponses: originalExam.melange_reponses,
      createdById: req.user!.id,
      questions: {
        create: originalExam.questions.map(q => ({
          enonce: q.enonce,
          type: q.type,
          points: q.points,
          ordre: q.ordre,
          answers: {
            create: q.answers.map(a => ({
              texte: a.texte,
              est_correcte: a.est_correcte,
              ordre: a.ordre,
            })),
          },
        })),
      },
    },
    include: {
      createdBy: { select: { id: true, nom: true, prenom: true } },
      _count: { select: { questions: true } },
    },
  })

  res.status(201).json({ message: 'Examen dupliqué avec succès', exam: newExam })
})
