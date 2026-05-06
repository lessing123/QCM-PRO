import { createServer } from 'http'
import app from './app.js'
import { initSocket } from './socket/socketServer.js'

const PORT = process.env.PORT || 3001

const httpServer = createServer(app)
initSocket(httpServer)

httpServer.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`)
  console.log(`📚 API disponible sur http://localhost:${PORT}/api`)
})
