import { Response } from 'express'
import { prisma } from '../config/db.js'
import { AuthRequest, asyncHandler } from '../middlewares/authMiddleware.js'
import { groupSchema, idParamSchema } from '../utils/validators.js'

// Liste de toutes les classes
export const getAllGroups = asyncHandler(async (req: AuthRequest, res: Response) => {
  const groups = await prisma.group.findMany({
    include: {
      users: { select: { id: true, nom: true, prenom: true, email: true } },
      _count: { select: { users: true, exams: true } },
    },
    orderBy: { nom: 'asc' },
  })

  res.json({ groups })
})

// Obtenir une classe par ID
export const getGroupById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = idParamSchema.parse(req.params)

  const group = await prisma.group.findUnique({
    where: { id },
    include: {
      users: { select: { id: true, nom: true, prenom: true, email: true } },
      exams: { select: { id: true, titre: true, duree_minutes: true } },
    },
  })

  if (!group) {
    return res.status(404).json({ error: 'Classe non trouvée' })
  }

  res.json({ group })
})

// Créer une classe
export const createGroup = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { nom, description, userIds } = groupSchema.parse(req.body)

  const existingGroup = await prisma.group.findUnique({ where: { nom } })
  if (existingGroup) {
    return res.status(409).json({ error: 'Ce nom de classe existe déjà' })
  }

  const group = await prisma.group.create({
    data: {
      nom,
      description,
      users: userIds ? { connect: userIds.map(id => ({ id })) } : undefined,
    },
    include: {
      users: { select: { id: true, nom: true, prenom: true, email: true } },
    },
  })

  res.status(201).json({ message: 'Classe créée avec succès', group })
})

// Mettre à jour une classe
export const updateGroup = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = idParamSchema.parse(req.params)
  const { nom, description, userIds } = req.body

  const existingGroup = await prisma.group.findUnique({ where: { id } })
  if (!existingGroup) {
    return res.status(404).json({ error: 'Classe non trouvée' })
  }

  if (nom && nom !== existingGroup.nom) {
    const nameExists = await prisma.group.findUnique({ where: { nom } })
    if (nameExists) {
      return res.status(409).json({ error: 'Ce nom de classe existe déjà' })
    }
  }

  const group = await prisma.group.update({
    where: { id },
    data: {
      nom,
      description,
      users: userIds ? { set: userIds.map((uid: string) => ({ id: uid })) } : undefined,
    },
    include: {
      users: { select: { id: true, nom: true, prenom: true, email: true } },
    },
  })

  res.json({ message: 'Classe mise à jour avec succès', group })
})

// Supprimer une classe
export const deleteGroup = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = idParamSchema.parse(req.params)

  const existingGroup = await prisma.group.findUnique({ where: { id } })
  if (!existingGroup) {
    return res.status(404).json({ error: 'Classe non trouvée' })
  }

  await prisma.group.delete({ where: { id } })
  res.json({ message: 'Classe supprimée avec succès' })
})

// Ajouter des étudiants à une classe
export const addStudentsToGroup = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = idParamSchema.parse(req.params)
  const { userIds } = req.body as { userIds: string[] }

  if (!Array.isArray(userIds) || userIds.length === 0) {
    return res.status(400).json({ error: 'Liste des IDs d\'étudiants requise' })
  }

  const group = await prisma.group.findUnique({ where: { id } })
  if (!group) {
    return res.status(404).json({ error: 'Classe non trouvée' })
  }

  await prisma.group.update({
    where: { id },
    data: { users: { connect: userIds.map(uid => ({ id: uid })) } },
  })

  res.json({ message: 'Étudiants ajoutés à la classe' })
})

// Retirer des étudiants d'une classe
export const removeStudentsFromGroup = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = idParamSchema.parse(req.params)
  const { userIds } = req.body as { userIds: string[] }

  if (!Array.isArray(userIds) || userIds.length === 0) {
    return res.status(400).json({ error: 'Liste des IDs d\'étudiants requise' })
  }

  await prisma.group.update({
    where: { id },
    data: { users: { disconnect: userIds.map(uid => ({ id: uid })) } },
  })

  res.json({ message: 'Étudiants retirés de la classe' })
})
