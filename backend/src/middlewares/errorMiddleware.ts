import { Request, Response, NextFunction } from 'express'

// Type pour les erreurs personnalisées
export class AppError extends Error {
  statusCode: number
  isOperational: boolean

  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true

    Error.captureStackTrace(this, this.constructor)
  }
}

// Middleware de gestion des erreurs
export function errorMiddleware(err: Error, req: Request, res: Response, next: NextFunction) {
  console.error('Erreur:', err.message)

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
    })
  }

  // Erreurs de validation Zod
  if (err.name === 'ZodError') {
    return res.status(400).json({
      error: 'Données invalides',
      details: (err as any).errors,
    })
  }

  // Erreurs Prisma
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as any
    if (prismaError.code === 'P2002') {
      return res.status(409).json({
        error: 'Cette valeur existe déjà',
      })
    }
    if (prismaError.code === 'P2003') {
      return res.status(409).json({
        error: 'Impossible de supprimer cet élément car il est encore utilisé',
      })
    }
    if (prismaError.code === 'P2025') {
      return res.status(404).json({
        error: 'Ressource non trouvée',
      })
    }
  }

  // Erreur par défaut
  res.status(500).json({
    error: 'Erreur interne du serveur',
  })
}

// Middleware de validation avec Zod
export function validate(schema: any) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body)
      next()
    } catch (error) {
      next(error)
    }
  }
}

// Middleware pour async/await (évite les try/catch dans chaque controller)
export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}
