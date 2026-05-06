# QCM - Application de gestion d'examens en ligne

Application web complète de gestion de QCM pour examens en ligne avec une interface d'administration et une interface étudiant.

## 🚀 Fonctionnalités

### Interface Administrateur
- Dashboard avec statistiques globales
- CRUD complet des examens
- Gestion des questions et réponses
- Gestion des étudiants (création, import CSV)
- Gestion des groupes
- Visualisation des résultats par examen
- Statistiques détaillées par question
- Export CSV des résultats

### Interface Étudiant
- Liste des examens disponibles
- Instructions avant examen
- Interface d'examen avec :
  - Timer visible
  - Navigation entre questions
  - Marquage pour révision
  - Sauvegarde automatique
  - Détection de changement d'onglet
  - Confirmation avant soumission

### Sécurité
- Authentification JWT avec refresh token
- Hash des mots de passe avec bcrypt
- Validation côté serveur avec Zod
- Vérification du nombre de tentatives
- Détection de changement d'onglet (anti-triche)
- Désactivation du clic droit et copier-coller pendant l'examen

## 🛠️ Stack Technique

- **Frontend**: React + Vite + Tailwind CSS + React Router
- **Backend**: Node.js + Express
- **Base de données**: SQLite (via Prisma)
- **Authentification**: JWT + bcrypt

## 📁 Structure du projet

```
QCM/
├── backend/                 # API REST Node.js
│   ├── prisma/            # Schéma et seed
│   ├── src/
│   │   ├── config/       # Configuration DB
│   │   ├── controllers/  # Logique métier
│   │   ├── middlewares/  # Middlewares Express
│   │   ├── routes/       # Définitions routes
│   │   ├── services/     # Services
│   │   └── utils/        # Utilitaires
│   └── package.json
│
└── frontend/              # Application React
    ├── src/
    │   ├── components/   # Composants réutilisables
    │   ├── pages/        # Pages
    │   ├── hooks/        # Hooks personnalisés
    │   ├── services/     # Appels API
    │   ├── context/      # React Context
    │   └── types/        # Types TypeScript
    └── package.json
```

## 📋 Prérequis

- Node.js version 18+
- npm ou yarn

## ⚙️ Installation

1. **Cloner le projet**

2. **Installer les dépendances**
```bash
# Installer les dépendances du monorepo
npm install

# Ou installer chaque partie séparément
cd backend && npm install
cd ../frontend && npm install
```

3. **Configuration de l'environnement**

Dupliquer le fichier `.env.example` en `.env` dans le dossier `backend`:
```bash
cp backend/.env.example backend/.env
```

4. **Initialiser la base de données**
```bash
cd backend
npx prisma generate
npx prisma db push
```

5. **Charger les données de test (optionnel)**
```bash
cd backend
npm run seed
```

## 🚦 Lancement

### Mode développement (les deux en même temps)
```bash
npm run dev
```

### Backend seul
```bash
cd backend
npm run dev
# API disponible sur http://localhost:3001
```

### Frontend seul
```bash
cd frontend
npm run dev
# Application disponible sur http://localhost:5173
```

## 🔑 Comptes de test

Après avoir exécuté le seed :

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | admin@test.com | admin123 |
| Étudiant | etudiant1@test.com | student123 |
| Étudiant | etudiant2@test.com | student123 |
| Étudiant | etudiant3@test.com | student123 |
| Étudiant | etudiant4@test.com | student123 |
| Étudiant | etudiant5@test.com | student123 |

## 📝 Variables d'environnement

### Backend (.env)
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="votre-secret-jwt-tres-securise-a-changer-en-production"
JWT_REFRESH_SECRET="votre-refresh-secret-encore-plus-securise"
JWT_EXPIRES_IN="1h"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=3001
```

### Frontend (.env)
```env
VITE_API_URL="http://localhost:3001/api"
```

## 📚 Documentation API

Une fois le backend lancé, vous pouvez accéder à la documentation Swagger (si implémentée) ou tester les endpoints avec Postman.

### Endpoints principaux

#### Auth
- `POST /api/auth/login` - Connexion
- `POST /api/auth/register` - Inscription (admin)
- `GET /api/auth/me` - Profil utilisateur

#### Admin
- `GET /api/admin/exams` - Liste des examens
- `POST /api/admin/exams` - Créer un examen
- `GET /api/admin/students` - Liste des étudiants
- `POST /api/admin/students/import` - Importer des étudiants
- `GET /api/admin/results/:examId` - Résultats d'un examen
- `GET /api/admin/stats/:examId` - Statistiques

#### Étudiant
- `GET /api/student/exams` - Examens disponibles
- `POST /api/student/exams/:id/start` - Démarrer un examen
- `POST /api/student/attempts/:id/answer` - Soumettre une réponse
- `POST /api/student/attempts/:id/submit` - Terminer l'examen

## 🎨 Design

- Interface moderne et épurée avec Tailwind CSS
- Palette de couleurs professionnelle
- Composants réutilisables
- Responsive (mobile, tablette, desktop)
- Toasts pour les notifications

## 📄 License

MIT