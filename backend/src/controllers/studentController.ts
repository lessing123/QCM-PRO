import { Response } from 'express'
import bcrypt from 'bcryptjs'
import { prisma } from '../config/db.js'
import { AuthRequest, asyncHandler } from '../middlewares/authMiddleware.js'
import { registerSchema, importStudentsSchema, idParamSchema } from '../utils/validators.js'

const DEFAULT_PASSWORD = 'Esgis2026'

// Liste de tous les étudiants (avec password_temp pour l'admin)
export const getAllStudents = asyncHandler(async (req: AuthRequest, res: Response) => {
  const students = await prisma.user.findMany({
    where: { role: 'STUDENT' },
    select: {
      id: true,
      email: true,
      nom: true,
      prenom: true,
      is_online: true,
      last_seen: true,
      must_change_password: true,
      password_temp: true,
      createdAt: true,
      groups: { select: { id: true, nom: true } },
      _count: { select: { attempts: true } },
    },
    orderBy: { nom: 'asc' },
  })
  res.json({ students })
})

// Obtenir un étudiant par ID
export const getStudentById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = idParamSchema.parse(req.params)
  const student = await prisma.user.findFirst({
    where: { id, role: 'STUDENT' },
    select: {
      id: true,
      email: true,
      nom: true,
      prenom: true,
      must_change_password: true,
      password_temp: true,
      createdAt: true,
      groups: { select: { id: true, nom: true } },
      attempts: {
        include: { exam: { select: { id: true, titre: true } } },
        orderBy: { date_debut: 'desc' },
      },
    },
  })
  if (!student) return res.status(404).json({ error: 'Étudiant non trouvé' })
  res.json({ student })
})

// Créer un étudiant — mot de passe standard + attribution de groupe optionnelle
export const createStudent = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { email, nom, prenom } = registerSchema.parse(req.body)
  const plainPassword = (req.body.password as string) || DEFAULT_PASSWORD
  const groupIds: string[] = Array.isArray(req.body.groupIds) ? req.body.groupIds : []

  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) return res.status(409).json({ error: 'Cet email est déjà utilisé' })

  const hashedPassword = await bcrypt.hash(plainPassword, 10)

  const student = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      password_temp: plainPassword,
      must_change_password: true,
      nom,
      prenom,
      role: 'STUDENT',
      groups: groupIds.length > 0 ? { connect: groupIds.map(id => ({ id })) } : undefined,
    },
    select: {
      id: true, email: true, nom: true, prenom: true,
      password_temp: true, must_change_password: true, createdAt: true,
      groups: { select: { id: true, nom: true } },
    },
  })
  res.status(201).json({ message: 'Étudiant créé avec succès', student })
})

// Mettre à jour un étudiant
export const updateStudent = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = idParamSchema.parse(req.params)
  const { email, nom, prenom, password, groupIds } = req.body

  const existingStudent = await prisma.user.findFirst({ where: { id, role: 'STUDENT' } })
  if (!existingStudent) return res.status(404).json({ error: 'Étudiant non trouvé' })

  const updateData: Record<string, any> = {}
  if (email && email !== existingStudent.email) {
    const emailExists = await prisma.user.findUnique({ where: { email } })
    if (emailExists) return res.status(409).json({ error: 'Cet email est déjà utilisé' })
    updateData.email = email
  }
  if (nom)    updateData.nom    = nom
  if (prenom) updateData.prenom = prenom
  if (password) {
    updateData.password      = await bcrypt.hash(password, 10)
    updateData.password_temp = password
    updateData.must_change_password = true
  }
  if (Array.isArray(groupIds)) {
    updateData.groups = { set: groupIds.map((gid: string) => ({ id: gid })) }
  }

  const student = await prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true, email: true, nom: true, prenom: true,
      password_temp: true, must_change_password: true, updatedAt: true,
      groups: { select: { id: true, nom: true } },
    },
  })
  res.json({ message: 'Étudiant mis à jour avec succès', student })
})

// Supprimer un étudiant
export const deleteStudent = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = idParamSchema.parse(req.params)
  const existingStudent = await prisma.user.findFirst({ where: { id, role: 'STUDENT' } })
  if (!existingStudent) return res.status(404).json({ error: 'Étudiant non trouvé' })
  await prisma.user.delete({ where: { id } })
  res.json({ message: 'Étudiant supprimé avec succès' })
})

// Réinitialiser le mot de passe d'un étudiant (admin)
export const resetStudentPassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = idParamSchema.parse(req.params)
  const newPassword: string = (req.body.password as string) || DEFAULT_PASSWORD

  const student = await prisma.user.findFirst({ where: { id, role: 'STUDENT' } })
  if (!student) return res.status(404).json({ error: 'Étudiant non trouvé' })

  await prisma.user.update({
    where: { id },
    data: {
      password:             await bcrypt.hash(newPassword, 10),
      password_temp:        newPassword,
      must_change_password: true,
    },
  })
  res.json({ message: 'Mot de passe réinitialisé', password: newPassword })
})

// Importer plusieurs étudiants via CSV/JSON
export const importStudents = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { students } = importStudentsSchema.parse(req.body)
  const groupId: string | undefined = typeof req.body.groupId === 'string' ? req.body.groupId : undefined
  const created: any[] = []
  const errors: any[] = []

  for (const student of students) {
    try {
      const existingUser = await prisma.user.findUnique({ where: { email: student.email } })
      if (existingUser) { errors.push({ email: student.email, error: 'Email déjà utilisé' }); continue }

      const newStudent = await prisma.user.create({
        data: {
          email:                student.email,
          password:             await bcrypt.hash(DEFAULT_PASSWORD, 10),
          password_temp:        DEFAULT_PASSWORD,
          must_change_password: true,
          nom:                  student.nom,
          prenom:               student.prenom,
          role:                 'STUDENT',
          groups:               groupId ? { connect: [{ id: groupId }] } : undefined,
        },
        select: { id: true, email: true, nom: true, prenom: true, password_temp: true },
      })
      created.push(newStudent)
    } catch {
      errors.push({ email: student.email, error: 'Erreur lors de la création' })
    }
  }

  res.status(201).json({
    message: `${created.length} étudiant(s) importé(s)`,
    students: created,
    errors: errors.length > 0 ? errors : undefined,
  })
})
