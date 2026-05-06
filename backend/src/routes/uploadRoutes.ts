import { Router } from 'express'
import { authMiddleware } from '../middlewares/authMiddleware.js'
import { upload, uploadImage } from '../controllers/uploadController.js'

const router = Router()

router.post('/image', authMiddleware, upload.single('image'), uploadImage)

export default router
