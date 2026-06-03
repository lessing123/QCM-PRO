import { Router } from 'express'
import { authMiddleware, requireStudent } from '../middlewares/authMiddleware.js'
import * as attemptController from '../controllers/attemptController.js'

const router = Router()

// Endpoint beacon sans auth stricte (sendBeacon envoie le token dans le body)
router.post('/attempts/:id/quit', attemptController.quitExam)

// Applique le middleware d'authentification et de rôle étudiant à toutes les routes
router.use(authMiddleware, requireStudent)

// ========== EXAMENS ==========
router.get('/exams', attemptController.getAvailableExams)
router.get('/exams/:id', attemptController.getExamDetails)
router.post('/exams/:id/start', attemptController.startExam)

// ========== TENTATIVES ==========
router.get('/attempts', attemptController.getMyAttempts)
router.get('/attempts/:id', attemptController.getAttemptById)
router.post('/attempts/:id/answer', attemptController.submitAnswer)
router.post('/attempts/:id/submit', attemptController.submitExam)
router.post('/attempts/:id/quit',   attemptController.quitExam)
router.get('/results/:id', attemptController.getExamResult)

export default router