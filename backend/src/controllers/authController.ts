import { Response } from 'express'
import bcrypt from 'bcryptjs'
import { prisma } from '../config/db.js'
import { generateTokens, verifyToken, AuthRequest, asyncHandler, type TokenPayload } from '../middlewares/authMiddleware.js'
import { registerSchema, loginSchema } from '../utils/validators.js'

// Inscription (admin uniquement)
export const register = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { email, password, nom, prenom, role } = registerSchema.parse(req.body)
  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) return res.status(409).json({ error: 'Cet email est déjà utilisé' })

  const hashedPassword = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: { email, password: hashedPassword, nom, prenom, role: role || 'STUDENT' },
    select: { id: true, email: true, nom: true, prenom: true, role: true, createdAt: true },
  })
  res.status(201).json({ message: 'Utilisateur créé avec succès', user })
})

// Connexion — retourne must_change_password
export const login = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { email, password } = loginSchema.parse(req.body)

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return res.status(401).json({ error: 'Email ou mot de passe incorrect' })

  const isValid = await bcrypt.compare(password, user.password)
  if (!isValid) return res.status(401).json({ error: 'Email ou mot de passe incorrect' })

  const tokens = generateTokens({
    userId: user.id,
    email: user.email,
    role: user.role as TokenPayload['role'],
  })

  res.json({
    message: 'Connexion réussie',
    user: {
      id: user.id,
      email: user.email,
      nom: user.nom,
      prenom: user.prenom,
      role: user.role,
      must_change_password: user.must_change_password,
    },
    ...tokens,
  })
})

// Profil de l'utilisateur connecté
export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: {
      id: true, email: true, nom: true, prenom: true,
      role: true, must_change_password: true, createdAt: true,
    },
  })
  if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' })
  res.json({ user })
})

// Changer son propre mot de passe (étudiant — 1ère connexion ou volontaire)
export const changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body as {
    currentPassword: string
    newPassword: string
  }

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'Le nouveau mot de passe doit contenir au moins 6 caractères' })
  }

  const user = await prisma.user.findUnique({ where: { id: req.user!.id } })
  if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' })

  // Vérifier l'ancien mot de passe uniquement si ce n'est pas un changement forcé
  if (!user.must_change_password) {
    if (!currentPassword) return res.status(400).json({ error: 'Mot de passe actuel requis' })
    const isValid = await bcrypt.compare(currentPassword, user.password)
    if (!isValid) return res.status(401).json({ error: 'Mot de passe actuel incorrect' })
  }

  await prisma.user.update({
    where: { id: req.user!.id },
    data: {
      password:             await bcrypt.hash(newPassword, 10),
      password_temp:        null,   // effacé après changement
      must_change_password: false,
    },
  })

  res.json({ message: 'Mot de passe modifié avec succès' })
})

// Rafraîchir le token
export const refreshToken = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { refreshToken } = req.body
  if (!refreshToken) return res.status(400).json({ error: 'Refresh token requis' })

  try {
    const payload = verifyToken(refreshToken, true)
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, role: true },
    })
    if (!user) return res.status(401).json({ error: 'Utilisateur non trouvé' })
    res.json(generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role as TokenPayload['role'],
    }))
  } catch {
    return res.status(401).json({ error: 'Refresh token invalide' })
  }
})
