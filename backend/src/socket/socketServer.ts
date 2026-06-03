import { Server as HttpServer } from 'http'
import { Server as SocketServer, Socket } from 'socket.io'
import { prisma } from '../config/db.js'
import { TokenPayload, verifyToken } from '../middlewares/authMiddleware.js'

export let io: SocketServer

export function initSocket(httpServer: HttpServer) {
  io = new SocketServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  })

  // Middleware d'authentification Socket
  io.use(async (socket: Socket, next) => {
    try {
      const token = socket.handshake.auth?.token as string
      if (!token) return next(new Error('Token manquant'))
      const payload = verifyToken(token) as TokenPayload
      socket.data.userId = payload.userId
      socket.data.role   = payload.role
      next()
    } catch {
      next(new Error('Token invalide'))
    }
  })

  io.on('connection', async (socket: Socket) => {
    const { userId, role } = socket.data

    // Chaque utilisateur rejoint sa salle personnelle (pour le déblocage ciblé)
    socket.join(`user:${userId}`)

    // Mise à jour statut en ligne
    await prisma.user.update({
      where: { id: userId },
      data: { is_online: true, last_seen: new Date() },
    }).catch(() => {})

    if (role === 'ADMIN') socket.join('admins')

    io.to('admins').emit('user:status', { userId, is_online: true })

    // ── Changement d'onglet → BLOCAGE IMMÉDIAT ────────────────────────────────
    socket.on('student:tab-change', async ({ examId, examTitre }: { examId: string; examTitre: string }) => {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { nom: true, prenom: true },
      }).catch(() => null)
      if (!user) return

      // Trouver la tentative en cours et la bloquer
      const attempt = await prisma.attempt.findFirst({
        where: { userId, examId, statut: 'EN_COURS' },
      }).catch(() => null)

      let attemptId: string | null = null

      if (attempt) {
        await prisma.attempt.update({
          where: { id: attempt.id },
          data: { bloque: true },
        }).catch(() => {})
        attemptId = attempt.id

        // Bloquer l'écran de l'étudiant immédiatement
        socket.emit('attempt:blocked', { attemptId: attempt.id })
      }

      // Sauvegarder la notification admin
      const message = `${user.prenom} ${user.nom} a changé d'onglet pendant l'examen "${examTitre}"`
      const notif = await prisma.notification.create({
        data: { type: 'TAB_CHANGE', message, userId, examId },
        include: { user: { select: { nom: true, prenom: true } } },
      }).catch(() => null)

      if (notif) {
        // Envoyer la notif admin avec l'ID de tentative pour le bouton Débloquer
        io.to('admins').emit('notification:new', {
          ...notif,
          attemptId,
          canUnblock: !!attemptId,
        })
      }
    })

    // ── Quitter la page d'examen → BLOCAGE IMMÉDIAT ──────────────────────────
    socket.on('student:exam-quit', async ({ examId, examTitre }: { examId: string; examTitre: string }) => {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { nom: true, prenom: true },
      }).catch(() => null)
      if (!user) return

      // Bloquer la tentative en cours
      const attempt = await prisma.attempt.findFirst({
        where: { userId, examId, statut: 'EN_COURS' },
      }).catch(() => null)

      let attemptId: string | null = null
      if (attempt) {
        await prisma.attempt.update({
          where: { id: attempt.id },
          data: { bloque: true },
        }).catch(() => {})
        attemptId = attempt.id
        socket.emit('attempt:blocked', { attemptId: attempt.id })
      }

      const message = `${user.prenom} ${user.nom} a quitté la page de l'examen "${examTitre}"`
      const notif = await prisma.notification.create({
        data: { type: 'EXAM_QUIT', message, userId, examId },
        include: { user: { select: { nom: true, prenom: true } } },
      }).catch(() => null)

      if (notif) io.to('admins').emit('notification:new', {
        ...notif,
        attemptId,
        canUnblock: !!attemptId,
      })
    })

    // Heartbeat
    socket.on('heartbeat', () => {
      prisma.user.update({ where: { id: userId }, data: { last_seen: new Date() } }).catch(() => {})
    })

    // ── Déconnexion ───────────────────────────────────────────────────────────
    socket.on('disconnect', async () => {
      const sockets = await io.fetchSockets()
      const stillConnected = sockets.some(s => s.data.userId === userId && s.id !== socket.id)
      if (!stillConnected) {
        await prisma.user.update({
          where: { id: userId },
          data: { is_online: false, last_seen: new Date() },
        }).catch(() => {})
        io.to('admins').emit('user:status', { userId, is_online: false })
      }
    })
  })

  console.log('Socket.io initialisé')
  return io
}

// Débloquer un étudiant depuis l'API (appelé par le contrôleur admin)
export function emitUnblock(targetUserId: string, attemptId: string) {
  io?.to(`user:${targetUserId}`).emit('attempt:unblocked', { attemptId })
}
