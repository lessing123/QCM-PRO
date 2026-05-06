import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

const SOCKET_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : 'http://localhost:3001'

export function connectSocket(token: string): Socket {
  if (socket?.connected) return socket

  socket = io(SOCKET_URL, {
    auth: { token },
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  })

  // Heartbeat toutes les 30s
  const interval = setInterval(() => {
    if (socket?.connected) socket.emit('heartbeat')
  }, 30_000)

  socket.on('disconnect', () => clearInterval(interval))

  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export function getSocket(): Socket | null {
  return socket
}

export function emitTabChange(examId: string, examTitre: string) {
  socket?.emit('student:tab-change', { examId, examTitre })
}

export function emitExamQuit(examId: string, examTitre: string) {
  socket?.emit('student:exam-quit', { examId, examTitre })
}
