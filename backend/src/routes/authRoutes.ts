import { Router } from 'express'
import { register, login, getMe, refreshToken, changePassword } from '../controllers/authController.js'
import { authMiddleware, requireAdmin } from '../middlewares/authMiddleware.js'

const router = Router()

router.post('/register',        authMiddleware, requireAdmin, register)
router.post('/login',           login)
router.post('/refresh',         refreshToken)
router.get('/me',               authMiddleware, getMe)
router.post('/change-password', authMiddleware, changePassword)

export default router
