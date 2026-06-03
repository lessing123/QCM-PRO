import { Request, Response, NextFunction } from 'express'
import jwt, { type SignOptions } from 'jsonwebtoken'
import { prisma } from '../config/db.js'

// Extension de l'interface Request pour ajouter l'utilisateur
export interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
    role: 'ADMIN' | 'STUDENT'
  }
}

// Type pour le payload du token JWT
export interface TokenPayload {
  userId: string
  email: string
  role: 'ADMIN' | 'STUDENT'
  st?: string  // session token (unicité de session étudiant)
}

function getRequiredEnv(name: string) {
  const value = process.env[name]
  if (!value) throw new Error(`${name} manquant`)
  return value
}

function parseExpiresIn(value: string | undefined, fallback: NonNullable<SignOptions['expiresIn']>) {
  return (value || fallback) as NonNullable<SignOptions['expiresIn']>
}

// Génère les tokens JWT (access et refresh)
export function generateTokens(payload: TokenPayload) {
  const accessToken = jwt.sign(payload, getRequiredEnv('JWT_SECRET'), {
    expiresIn: parseExpiresIn(process.env.JWT_EXPIRES_IN, '1h'),
  })

  const refreshToken = jwt.sign(payload, getRequiredEnv('JWT_REFRESH_SECRET'), {
    expiresIn: parseExpiresIn(process.env.JWT_REFRESH_EXPIRES_IN, '7d'),
  })

  return { accessToken, refreshToken }
}

// Vérifie le token JWT
export function verifyToken(token: string, isRefresh = false) {
  const secret = isRefresh
    ? getRequiredEnv('JWT_REFRESH_SECRET')
    : getRequiredEnv('JWT_SECRET')

  return jwt.verify(token, secret) as TokenPayload
}

// Middleware d'authentification
export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token manquant' })
    }

    const token = authHeader.split(' ')[1]
    const payload = verifyToken(token)

    // Vérifie que l'utilisateur existe toujours
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, role: true, is_active: true, session_token: true },
    })

    if (!user) {
      return res.status(401).json({ error: 'Utilisateur non trouvé' })
    }

    if (!(user as any).is_active) {
      return res.status(403).json({ error: 'Compte désactivé. Contactez votre administrateur.' })
    }

    if (user.role !== 'ADMIN' && user.role !== 'STUDENT') {
      return res.status(500).json({ error: 'Rôle utilisateur invalide' })
    }

    // Vérification unicité de session pour les étudiants
    if (user.role === 'STUDENT' && payload.st && (user as any).session_token !== payload.st) {
      return res.status(401).json({ error: 'Session expirée — connexion depuis un autre appareil détectée.' })
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role as TokenPayload['role'],
    }

    next()
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'Token expiré' })
    }
    return res.status(401).json({ error: 'Token invalide' })
  }
}

// Middleware pour vérifier le rôle admin
export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Accès refusé. Réservé aux administrateurs.' })
  }
  next()
}

// Middleware pour vérifier le rôle étudiant
export function requireStudent(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.user?.role !== 'STUDENT') {
    return res.status(403).json({ error: 'Accès refusé. Réservé aux étudiants.' })
  }
  next()
}

// Wrapper async pour éviter le try/catch répétitif dans chaque contrôleur
export function asyncHandler(fn: (req: AuthRequest, res: Response, next: NextFunction) => Promise<any>) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}
