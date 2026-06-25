import { Response } from 'express'
import { prisma } from '../config/db.js'
import { AuthRequest, asyncHandler } from '../middlewares/authMiddleware.js'
import { idParamSchema } from '../utils/validators.js'
import { emitUnblock } from '../socket/socketServer.js'

// Liste des notifications
export const getNotifications = asyncHandler(async (req: AuthRequest, res: Response) => {
  const notifications = await prisma.notification.findMany({
    include: { user: { select: { id: true, nom: true, prenom: true, email: true } } },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  // Enrichir chaque notification TAB_CHANGE avec le statut bloque de la tentative
  const enriched = await Promise.all(
    notifications.map(async (n) => {
      if (n.type !== 'TAB_CHANGE' || !n.examId) return { ...n, attemptId: null, canUnblock: false }
      const attempt = await prisma.attempt.findFirst({
        where: { userId: n.userId, examId: n.examId, statut: 'EN_COURS' },
        select: { id: true, bloque: true },
      })
      return {
        ...n,
        attemptId: attempt?.id ?? null,
        canUnblock: attempt?.bloque === true,
      }
    })
  )

  const unreadCount = enriched.filter(n => !n.lu).length
  res.json({ notifications: enriched, unreadCount })
})

// Marquer une notification comme lue
export const markAsRead = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = idParamSchema.parse(req.params)
  await prisma.notification.update({ where: { id }, data: { lu: true } })
  res.json({ message: 'Notification marquée comme lue' })
})

// Marquer toutes comme lues
export const markAllAsRead = asyncHandler(async (_req: AuthRequest, res: Response) => {
  await prisma.notification.updateMany({ where: { lu: false }, data: { lu: true } })
  res.json({ message: 'Toutes les notifications marquées comme lues' })
})

// Supprimer toutes les notifications
export const clearRead = asyncHandler(async (_req: AuthRequest, res: Response) => {
  await prisma.notification.deleteMany({})
  res.json({ message: 'Notifications supprimées' })
})

// DÉBLOQUER un étudiant — appelé par l'admin
export const unblockAttempt = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = idParamSchema.parse(req.params)

  const attempt = await prisma.attempt.findUnique({
    where: { id },
    include: { user: { select: { id: true, nom: true, prenom: true } } },
  })

  if (!attempt) return res.status(404).json({ error: 'Tentative non trouvée' })
  if (attempt.statut !== 'EN_COURS') return res.status(400).json({ error: 'L\'examen est déjà terminé' })

  await prisma.attempt.update({
    where: { id },
    data: { bloque: false },
  })

  // Envoyer l'événement de déblocage au socket de l'étudiant
  emitUnblock(attempt.user.id, id)

  res.json({
    message: `${attempt.user.prenom} ${attempt.user.nom} a été débloqué(e)`,
  })
})
