import { Routes, Route, Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from './context/AuthContext'
import Login from './pages/auth/Login'
import ChangePassword from './pages/auth/ChangePassword'
import AdminDashboard from './pages/admin/Dashboard'
import ExamList from './pages/admin/ExamList'
import ExamForm from './pages/admin/ExamForm'
import StudentList from './pages/admin/StudentList'
import GroupList from './pages/admin/GroupList'
import Results from './pages/admin/Results'
import ExamMonitor from './pages/admin/ExamMonitor'
import Stats from './pages/admin/Stats'
import AdminSettings from './pages/admin/AdminSettings'
import AdminGuide from './pages/admin/AdminGuide'
import StudentDashboard from './pages/student/StudentDashboard'
import ExamInstructions from './pages/student/ExamInstructions'
import TakeExam from './pages/student/TakeExam'
import ExamRecap from './pages/student/ExamRecap'
import ExamResult from './pages/student/ExamResult'
import History from './pages/student/History'
import StudentGuide from './pages/student/StudentGuide'
import Layout from './components/layout/Layout'

function ProtectedRoute({ children, allowedRole }: { children: ReactNode; allowedRole?: 'ADMIN' | 'STUDENT' }) {
  const { user, isLoading } = useAuth()

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 dark:border-primary-400" />
    </div>
  )

  if (!user) return <Navigate to="/login" replace />

  // Redirection forcée si changement de mot de passe requis
  if (user.must_change_password) return <Navigate to="/change-password" replace />

  if (allowedRole && user.role !== allowedRole)
    return <Navigate to={user.role === 'ADMIN' ? '/admin/dashboard' : '/student/dashboard'} replace />

  return <>{children}</>
}

export default function App() {
  const { user } = useAuth()

  return (
    <Routes>
      {/* Publique */}
      <Route path="/login" element={
        user && !user.must_change_password
          ? <Navigate to={user.role === 'ADMIN' ? '/admin/dashboard' : '/student/dashboard'} replace />
          : <Login />
      } />

      {/* Changement de mot de passe (forcé ou volontaire) */}
      <Route path="/change-password" element={
        user ? <ChangePassword /> : <Navigate to="/login" replace />
      } />

      {/* Admin */}
      <Route path="/admin" element={<ProtectedRoute allowedRole="ADMIN"><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="exams" element={<ExamList />} />
        <Route path="exams/new" element={<ExamForm />} />
        <Route path="exams/:id/edit" element={<ExamForm />} />
        <Route path="students" element={<StudentList />} />
        <Route path="classes" element={<GroupList />} />
        <Route path="groups" element={<Navigate to="/admin/classes" replace />} />
        <Route path="results/:examId" element={<Results />} />
        <Route path="exams/:examId/monitor" element={<ExamMonitor />} />
        <Route path="stats/:examId" element={<Stats />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="guide" element={<AdminGuide />} />
      </Route>

      {/* Etudiant — examen en plein écran sans Navbar */}
      <Route path="/student/exams/:id/take" element={<ProtectedRoute allowedRole="STUDENT"><TakeExam /></ProtectedRoute>} />

      {/* Etudiant */}
      <Route path="/student" element={<ProtectedRoute allowedRole="STUDENT"><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/student/dashboard" replace />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="exams/:id" element={<ExamInstructions />} />
        <Route path="recap/:attemptId" element={<ExamRecap />} />
        <Route path="results/:attemptId" element={<ExamResult />} />
        <Route path="history" element={<History />} />
        <Route path="guide" element={<StudentGuide />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
