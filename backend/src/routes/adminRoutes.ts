import { Router } from 'express'
import { authMiddleware, requireAdmin } from '../middlewares/authMiddleware.js'
import * as examController from '../controllers/examController.js'
import * as questionController from '../controllers/questionController.js'
import * as studentController from '../controllers/studentController.js'
import * as groupController from '../controllers/groupController.js'
import * as adminController from '../controllers/adminController.js'
import * as notifController from '../controllers/notificationController.js'

const router = Router()
router.use(authMiddleware, requireAdmin)

// Examens
router.get('/exams',                    examController.getAllExams)
router.get('/exams/:id',                examController.getExamById)
router.post('/exams',                   examController.createExam)
router.put('/exams/:id',                examController.updateExam)
router.delete('/exams/:id',             examController.deleteExam)
router.post('/exams/:id/duplicate',     examController.duplicateExam)
router.patch('/exams/:id/toggle-results', examController.toggleResultsPublics)

// Questions
router.get('/exams/:id/questions',      questionController.getQuestionsByExam)
router.get('/questions/:id',            questionController.getQuestionById)
router.post('/questions',               questionController.createQuestion)
router.put('/questions/:id',            questionController.updateQuestion)
router.delete('/questions/:id',         questionController.deleteQuestion)
router.put('/questions/:id/reorder',    questionController.reorderQuestions)

// Étudiants
router.get('/students',                 studentController.getAllStudents)
router.get('/students/:id',             studentController.getStudentById)
router.post('/students',                studentController.createStudent)
router.put('/students/:id',             studentController.updateStudent)
router.delete('/students/:id',          studentController.deleteStudent)
router.post('/students/import',         studentController.importStudents)
router.post('/students/:id/reset-password', studentController.resetStudentPassword)

// Groupes
router.get('/groups',                   groupController.getAllGroups)
router.get('/groups/:id',               groupController.getGroupById)
router.post('/groups',                  groupController.createGroup)
router.put('/groups/:id',               groupController.updateGroup)
router.delete('/groups/:id',            groupController.deleteGroup)
router.post('/groups/:id/students',     groupController.addStudentsToGroup)
router.delete('/groups/:id/students',   groupController.removeStudentsFromGroup)

// Classes (alias utilisateur)
router.get('/classes',                  groupController.getAllGroups)
router.get('/classes/:id',              groupController.getGroupById)
router.post('/classes',                 groupController.createGroup)
router.put('/classes/:id',              groupController.updateGroup)
router.delete('/classes/:id',           groupController.deleteGroup)
router.post('/classes/:id/students',    groupController.addStudentsToGroup)
router.delete('/classes/:id/students',  groupController.removeStudentsFromGroup)

// Résultats & stats
router.get('/results/:examId',          adminController.getExamResults)
router.get('/stats/:examId',            adminController.getExamStats)
router.get('/export/:examId',           adminController.exportResults)
router.get('/export/:examId/pdf',       adminController.exportResultsPdf)
router.get('/stats',                    adminController.getAdminStats)

// Notifications
router.get('/notifications',               notifController.getNotifications)
router.patch('/notifications/:id/read',    notifController.markAsRead)
router.patch('/notifications/read-all',    notifController.markAllAsRead)
router.delete('/notifications/clear',      notifController.clearRead)

// Déblocage d'un étudiant
router.post('/attempts/:id/unblock',       notifController.unblockAttempt)

export default router
