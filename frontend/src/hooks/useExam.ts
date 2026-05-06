import { useState, useCallback } from 'react'
import { examService } from '../services/examService'
import { Exam, ExamFormData, Question, QuestionFormData } from '../types'

export function useExam(_examId?: string) {
  const [exam, setExam] = useState<Exam | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadExam = useCallback(async (id: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const { exam } = await examService.getById(id)
      setExam(exam)
      if (exam.questions) {
        setQuestions(exam.questions)
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors du chargement de l\'examen')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createExam = async (data: ExamFormData) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await examService.create(data)
      return response.exam
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de la création de l\'examen')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const updateExam = async (id: string, data: ExamFormData) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await examService.update(id, data)
      setExam(response.exam)
      return response.exam
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de la mise à jour de l\'examen')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const deleteExam = async (id: string) => {
    setIsLoading(true)
    setError(null)
    try {
      await examService.delete(id)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de la suppression de l\'examen')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const duplicateExam = async (id: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await examService.duplicate(id)
      return response.exam
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de la duplication de l\'examen')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const addQuestion = async (data: QuestionFormData & { examId: string }) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await examService.createQuestion(data)
      setQuestions(prev => [...prev, response.question])
      return response.question
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de la création de la question')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const updateQuestion = async (id: string, data: Partial<QuestionFormData>) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await examService.updateQuestion(id, data)
      setQuestions(prev => prev.map(q => q.id === id ? response.question : q))
      return response.question
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de la mise à jour de la question')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const deleteQuestion = async (id: string) => {
    setIsLoading(true)
    setError(null)
    try {
      await examService.deleteQuestion(id)
      setQuestions(prev => prev.filter(q => q.id !== id))
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de la suppression de la question')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    exam,
    questions,
    isLoading,
    error,
    loadExam,
    createExam,
    updateExam,
    deleteExam,
    duplicateExam,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    setQuestions,
  }
}