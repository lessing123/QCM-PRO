# QCM - Plateforme de gestion d'examens en ligne

Application web de QCM avec deux espaces distincts:

- un espace d'administration pour créer et piloter les examens
- un espace étudiant pour passer les examens et suivre les résultats

Le projet combine un frontend React moderne, une API Node.js/Express et une base MySQL gérée avec Prisma.

## Fonctionnalités

### Espace administrateur

- création, modification, duplication et suppression d'examens
- gestion des questions et des réponses
- prise en charge des types `SINGLE`, `MULTIPLE` et `TRUE_FALSE`
- import de questions depuis `CSV`, `JSON`, `XLSX` ou `XLS`
- ajout d'images sur les réponses
- affectation des examens à des groupes / classes
- gestion des étudiants
- import en masse des étudiants
- réinitialisation des mots de passe étudiants
- consultation des résultats par examen
- statistiques détaillées par question
- export des résultats au format `CSV` et `PDF`
- notifications en temps réel
- déblocage manuel d'une tentative bloquée

### Espace étudiant

- liste des examens disponibles
- page d'instructions avant le démarrage
- passage d'examen avec chronomètre
- navigation libre entre les questions
- auto-sauvegarde des réponses
- prise en charge des réponses uniques et multiples
- historique des tentatives
- récapitulatif après soumission
- accès aux résultats publiés
- changement de mot de passe forcé à la première connexion si nécessaire

### Sécurité et anti-triche

- authentification JWT avec refresh token
- mots de passe hachés avec `bcrypt`
- validation des entrées avec `Zod`
- notifications temps réel via `Socket.IO`
- détection du changement d'onglet pendant un examen
- blocage temporaire d'une tentative côté serveur
- désactivation du clic droit et du copier-coller pendant l'examen

## Stack technique

- Frontend: React 18, Vite, TypeScript, Tailwind CSS, React Router
- Backend: Node.js, Express, TypeScript
- ORM: Prisma
- Base de données: MySQL
- Temps réel: Socket.IO
- Outils UI / data: Axios, Recharts, `react-hot-toast`, `xlsx`

## Structure du projet

```text
QCM/
|-- backend/               # API REST, Prisma, Socket.IO
|-- frontend/              # Interface React
|-- docker-compose.yml     # Stack complète en mode proche production
|-- docker-compose.dev.yml # MySQL seul pour le dev local
`-- .env.example           # Exemple de variables d'environnement
```

## Prérequis

- Node.js 18 ou plus
- npm
- MySQL 8 ou plus
- Docker, si vous souhaitez utiliser les fichiers Compose

## Installation locale

1. Installez toutes les dépendances depuis la racine du projet:

```bash
npm run install:all
```

2. Configurez le backend.

Le backend charge son fichier `.env` depuis le dossier `backend/`. Le fichier `.env.example` à la racine sert de modèle pour les variables nécessaires.

Exemple minimal pour `backend/.env`:

```env
DATABASE_URL="mysql://qcm_user:changeme-db-password@localhost:3306/qcm_db"
JWT_SECRET="changeme-jwt-secret-minimum-32-caracteres"
JWT_REFRESH_SECRET="changeme-refresh-secret-minimum-32-chars"
JWT_EXPIRES_IN="1h"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=3001
FRONTEND_URL="http://localhost:5173"
```

3. Initialisez le schéma Prisma.

```bash
cd backend
npx prisma generate
npx prisma db push
```

4. Chargez les données de démonstration si besoin.

```bash
npm run seed
```

Le seed crée notamment:

- un administrateur de test
- cinq étudiants de test
- un groupe d'exemple
- deux examens d'exemple avec questions et réponses

## Lancement en local

### Tout lancer d'un coup

```bash
npm run dev
```

Le frontend démarre sur `http://localhost:5173` et l'API sur `http://localhost:3001`.

### Backend seul

```bash
cd backend
npm run dev
```

### Frontend seul

```bash
cd frontend
npm run dev
```

Le frontend utilise par défaut le proxy Vite vers `/api`. Si vous déployez le backend ailleurs, vous pouvez définir `VITE_API_URL=http://localhost:3001/api`.

## Docker

### MySQL uniquement pour le développement

```bash
docker compose -f docker-compose.dev.yml up -d
```

Ce fichier démarre seulement MySQL sur le port `3306`.

### Stack complète

```bash
docker compose up --build
```

Le frontend est exposé sur le port `80`. Le backend et la base de données restent internes au réseau Docker.

Pensez à renseigner les variables attendues par `docker-compose.yml` dans un fichier `.env` à la racine.

## Comptes de test

Après le seed:

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | `admin@test.com` | `admin123` |
| Étudiant | `etudiant1@test.com` | `student123` |
| Étudiant | `etudiant2@test.com` | `student123` |
| Étudiant | `etudiant3@test.com` | `student123` |
| Étudiant | `etudiant4@test.com` | `student123` |
| Étudiant | `etudiant5@test.com` | `student123` |

## API principale

- Auth: `POST /api/auth/login`, `POST /api/auth/refresh`, `GET /api/auth/me`, `POST /api/auth/change-password`
- Admin: `GET/POST/PUT/DELETE /api/admin/exams`, `GET /api/admin/exams/:id/questions`, `GET /api/admin/results/:examId`, `GET /api/admin/stats/:examId`, `GET /api/admin/export/:examId`, `GET /api/admin/export/:examId/pdf`
- Étudiant: `GET /api/student/exams`, `POST /api/student/exams/:id/start`, `POST /api/student/attempts/:id/answer`, `POST /api/student/attempts/:id/submit`, `GET /api/student/results/:id`
- Upload: `POST /api/upload/image`
- Santé: `GET /api/health`

## Scripts utiles

### Racine

- `npm run dev` - lance backend et frontend
- `npm run dev:backend` - lance seulement le backend
- `npm run dev:frontend` - lance seulement le frontend
- `npm run install:all` - installe toutes les dépendances
- `npm run build` - build backend et frontend
- `npm run seed` - lance le seed du backend

### Backend

- `npm run dev` - serveur Express en mode watch
- `npm run build` - compilation TypeScript
- `npm run start` - lance le build compilé
- `npm run seed` - seed de la base
- `npm run dev:push` - `prisma db push` pour le schéma de dev
- `npm run dev:generate` - génération du client Prisma pour le schéma de dev

### Frontend

- `npm run dev` - serveur Vite
- `npm run build` - build de production
- `npm run preview` - prévisualisation du build

## Notes

- Les guides administrateur et étudiant sont aussi disponibles directement dans l'application.
- Les fichiers uploadés sont servis depuis `/uploads`.
- L'application s'appuie sur des événements Socket.IO pour les notifications et le suivi anti-triche.
