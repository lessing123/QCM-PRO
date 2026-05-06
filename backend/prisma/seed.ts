import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Début du seeding...')

  // 1. Créer l'admin
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      email: 'admin@test.com',
      password: adminPassword,
      nom: 'Administrateur',
      prenom: 'Système',
      role: 'ADMIN',
    },
  })
  console.log('✅ Admin créé:', admin.email)

  // 2. Créer 5 étudiants
  const students = [
    { email: 'etudiant1@test.com', nom: 'Dupont', prenom: 'Jean' },
    { email: 'etudiant2@test.com', nom: 'Martin', prenom: 'Marie' },
    { email: 'etudiant3@test.com', nom: 'Bernard', prenom: 'Pierre' },
    { email: 'etudiant4@test.com', nom: 'Petit', prenom: 'Sophie' },
    { email: 'etudiant5@test.com', nom: 'Durand', prenom: 'Lucas' },
  ]

  const studentPassword = await bcrypt.hash('student123', 10)
  const createdStudents = []

  for (const s of students) {
    const student = await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: {
        email: s.email,
        password: studentPassword,
        nom: s.nom,
        prenom: s.prenom,
        role: 'STUDENT',
      },
    })
    createdStudents.push(student)
    console.log('✅ Étudiant créé:', student.email)
  }

  // 3. Créer un groupe
  const group = await prisma.group.upsert({
    where: { nom: 'Groupe Test' },
    update: {},
    create: {
      nom: 'Groupe Test',
      description: 'Groupe pour les tests',
      users: {
        connect: createdStudents.map(s => ({ id: s.id })),
      },
    },
  })
  console.log('✅ Groupe créé:', group.nom)

  // 4. Créer un examen d'exemple 1
  const exam1 = await prisma.exam.create({
    data: {
      titre: 'Introduction à la Programmation',
      description: 'QCM de validation des connaissances en programmation',
      duree_minutes: 30,
      tentatives_max: 2,
      melange_questions: true,
      melange_reponses: true,
      createdById: admin.id,
      groups: {
        connect: [{ id: group.id }],
      },
      questions: {
        create: [
          {
            enonce: 'Quel langage est principalement utilisé pour le développement web côté client ?',
            type: 'SINGLE',
            points: 1,
            ordre: 1,
            answers: {
              create: [
                { texte: 'Python', est_correcte: false, ordre: 1 },
                { texte: 'JavaScript', est_correcte: true, ordre: 2 },
                { texte: 'Java', est_correcte: false, ordre: 3 },
                { texte: 'C++', est_correcte: false, ordre: 4 },
              ],
            },
          },
          {
            enonce: 'Quelle balise HTML est utilisée pour créer un lien hypertexte ?',
            type: 'SINGLE',
            points: 1,
            ordre: 2,
            answers: {
              create: [
                { texte: '<link>', est_correcte: false, ordre: 1 },
                { texte: '<a>', est_correcte: true, ordre: 2 },
                { texte: '<href>', est_correcte: false, ordre: 3 },
                { texte: '<url>', est_correcte: false, ordre: 4 },
              ],
            },
          },
          {
            enonce: 'CSS signifie Cascading Style Sheets',
            type: 'TRUE_FALSE',
            points: 1,
            ordre: 3,
            answers: {
              create: [
                { texte: 'Vrai', est_correcte: true, ordre: 1 },
                { texte: 'Faux', est_correcte: false, ordre: 2 },
              ],
            },
          },
          {
            enonce: 'Sélectionnez les langages de programmation backend :',
            type: 'MULTIPLE',
            points: 2,
            ordre: 4,
            answers: {
              create: [
                { texte: 'Node.js', est_correcte: true, ordre: 1 },
                { texte: 'PHP', est_correcte: true, ordre: 2 },
                { texte: 'HTML', est_correcte: false, ordre: 3 },
                { texte: 'Python', est_correcte: true, ordre: 4 },
              ],
            },
          },
          {
            enonce: 'Quelle méthode HTTP est utilisée pour envoyer des données au serveur ?',
            type: 'SINGLE',
            points: 1,
            ordre: 5,
            answers: {
              create: [
                { texte: 'GET', est_correcte: false, ordre: 1 },
                { texte: 'POST', est_correcte: true, ordre: 2 },
                { texte: 'PUT', est_correcte: false, ordre: 3 },
                { texte: 'DELETE', est_correcte: false, ordre: 4 },
              ],
            },
          },
          {
            enonce: 'Qu\'est-ce que React ?',
            type: 'SINGLE',
            points: 1,
            ordre: 6,
            answers: {
              create: [
                { texte: 'Un langage de programmation', est_correcte: false, ordre: 1 },
                { texte: 'Une bibliothèque JavaScript', est_correcte: true, ordre: 2 },
                { texte: 'Un système de gestion de base de données', est_correcte: false, ordre: 3 },
                { texte: 'Un serveur web', est_correcte: false, ordre: 4 },
              ],
            },
          },
          {
            enonce: 'Le protocole HTTPS utilise le port 443 par défaut',
            type: 'TRUE_FALSE',
            points: 1,
            ordre: 7,
            answers: {
              create: [
                { texte: 'Vrai', est_correcte: true, ordre: 1 },
                { texte: 'Faux', est_correcte: false, ordre: 2 },
              ],
            },
          },
          {
            enonce: 'Sélectionnez les balises de titre HTML valides :',
            type: 'MULTIPLE',
            points: 2,
            ordre: 8,
            answers: {
              create: [
                { texte: '<h1>', est_correcte: true, ordre: 1 },
                { texte: '<heading>', est_correcte: false, ordre: 2 },
                { texte: '<h6>', est_correcte: true, ordre: 3 },
                { texte: '<title>', est_correcte: false, ordre: 4 },
              ],
            },
          },
          {
            enonce: 'Quelle est la bonne syntaxe pour déclarer une variable en JavaScript ?',
            type: 'SINGLE',
            points: 1,
            ordre: 9,
            answers: {
              create: [
                { texte: 'var x = 5', est_correcte: false, ordre: 1 },
                { texte: 'let x = 5', est_correcte: true, ordre: 2 },
                { texte: 'int x = 5', est_correcte: false, ordre: 3 },
                { texte: 'variable x = 5', est_correcte: false, ordre: 4 },
              ],
            },
          },
          {
            enonce: 'Un cookie est un petit fichier stocké sur l\'ordinateur du client',
            type: 'TRUE_FALSE',
            points: 1,
            ordre: 10,
            answers: {
              create: [
                { texte: 'Vrai', est_correcte: true, ordre: 1 },
                { texte: 'Faux', est_correcte: false, ordre: 2 },
              ],
            },
          },
        ],
      },
    },
  })
  console.log('✅ Examen 1 créé:', exam1.titre)

  // 5. Créer un examen d'exemple 2
  const exam2 = await prisma.exam.create({
    data: {
      titre: 'Base de Données et SQL',
      description: 'QCM sur les bases de données relationnelles',
      duree_minutes: 45,
      tentatives_max: 3,
      melange_questions: false,
      melange_reponses: true,
      createdById: admin.id,
      questions: {
        create: [
          {
            enonce: 'Quelle commande SQL est utilisée pour sélectionner des données ?',
            type: 'SINGLE',
            points: 1,
            ordre: 1,
            answers: {
              create: [
                { texte: 'INSERT', est_correcte: false, ordre: 1 },
                { texte: 'SELECT', est_correcte: true, ordre: 2 },
                { texte: 'UPDATE', est_correcte: false, ordre: 3 },
                { texte: 'DELETE', est_correcte: false, ordre: 4 },
              ],
            },
          },
          {
            enonce: 'Une clé primaire (Primary Key) peut être composite',
            type: 'TRUE_FALSE',
            points: 1,
            ordre: 2,
            answers: {
              create: [
                { texte: 'Vrai', est_correcte: true, ordre: 1 },
                { texte: 'Faux', est_correcte: false, ordre: 2 },
              ],
            },
          },
          {
            enonce: 'Sélectionnez les commandes DDL (Data Definition Language) :',
            type: 'MULTIPLE',
            points: 2,
            ordre: 3,
            answers: {
              create: [
                { texte: 'CREATE', est_correcte: true, ordre: 1 },
                { texte: 'ALTER', est_correcte: true, ordre: 2 },
                { texte: 'SELECT', est_correcte: false, ordre: 3 },
                { texte: 'DROP', est_correcte: true, ordre: 4 },
              ],
            },
          },
          {
            enonce: 'Quelle clause SQL est utilisée pour filtrer les résultats ?',
            type: 'SINGLE',
            points: 1,
            ordre: 4,
            answers: {
              create: [
                { texte: 'WHERE', est_correcte: true, ordre: 1 },
                { texte: 'ORDER BY', est_correcte: false, ordre: 2 },
                { texte: 'GROUP BY', est_correcte: false, ordre: 3 },
                { texte: 'HAVING', est_correcte: false, ordre: 4 },
              ],
            },
          },
          {
            enonce: 'Le JOIN permet de combiner des données de plusieurs tables',
            type: 'TRUE_FALSE',
            points: 1,
            ordre: 5,
            answers: {
              create: [
                { texte: 'Vrai', est_correcte: true, ordre: 1 },
                { texte: 'Faux', est_correcte: false, ordre: 2 },
              ],
            },
          },
          {
            enonce: 'Quelle est la différence entre INNER JOIN et LEFT JOIN ?',
            type: 'SINGLE',
            points: 1,
            ordre: 6,
            answers: {
              create: [
                { texte: 'Aucune différence', est_correcte: false, ordre: 1 },
                { texte: 'INNER JOIN retourne seulement les correspondances, LEFT JOIN inclut toutes les lignes de la table de gauche', est_correcte: true, ordre: 2 },
                { texte: 'LEFT JOIN est plus rapide', est_correcte: false, ordre: 3 },
                { texte: 'INNER JOIN ne peut pas être utilisé avec des tables', est_correcte: false, ordre: 4 },
              ],
            },
          },
          {
            enonce: 'Sélectionnez les types de données SQL valides :',
            type: 'MULTIPLE',
            points: 2,
            ordre: 7,
            answers: {
              create: [
                { texte: 'VARCHAR', est_correcte: true, ordre: 1 },
                { texte: 'INTEGER', est_correcte: true, ordre: 2 },
                { texte: 'TEXT', est_correcte: true, ordre: 3 },
                { texte: 'NUMBER', est_correcte: false, ordre: 4 },
              ],
            },
          },
          {
            enonce: 'Quelle commande est utilisée pour insérer des données ?',
            type: 'SINGLE',
            points: 1,
            ordre: 8,
            answers: {
              create: [
                { texte: 'INSERT INTO', est_correcte: true, ordre: 1 },
                { texte: 'ADD TO', est_correcte: false, ordre: 2 },
                { texte: 'PUT IN', est_correcte: false, ordre: 3 },
                { texte: 'NEW DATA', est_correcte: false, ordre: 4 },
              ],
            },
          },
          {
            enonce: 'Une clé étrangère (Foreign Key) établit une relation entre deux tables',
            type: 'TRUE_FALSE',
            points: 1,
            ordre: 9,
            answers: {
              create: [
                { texte: 'Vrai', est_correcte: true, ordre: 1 },
                { texte: 'Faux', est_correcte: false, ordre: 2 },
              ],
            },
          },
          {
            enonce: 'Quelle clause est utilisée pour trier les résultats ?',
            type: 'SINGLE',
            points: 1,
            ordre: 10,
            answers: {
              create: [
                { texte: 'SORT BY', est_correcte: false, ordre: 1 },
                { texte: 'ORDER BY', est_correcte: true, ordre: 2 },
                { texte: 'GROUP BY', est_correcte: false, ordre: 3 },
                { texte: 'LIMIT', est_correcte: false, ordre: 4 },
              ],
            },
          },
        ],
      },
    },
  })
  console.log('✅ Examen 2 créé:', exam2.titre)

  // 6. Créer quelques tentatives pour le dashboard
  const student1Attempts = [
    { examId: exam1.id, score: 7, statut: 'TERMINE' },
    { examId: exam2.id, score: 8.5, statut: 'TERMINE' },
  ]

  for (const attempt of student1Attempts) {
    await prisma.attempt.create({
      data: {
        userId: createdStudents[0].id,
        examId: attempt.examId,
        score: attempt.score,
        date_debut: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        date_fin: new Date(),
        statut: attempt.statut,
      },
    })
  }
  console.log('✅ Tentatives créées pour le dashboard')

  console.log('\n🎉 Seeding terminé avec succès!')
  console.log('\n📋 Comptes de test:')
  console.log('   Admin: admin@test.com / admin123')
  console.log('   Étudiants: etudiant1@test.com à etudiant5@test.com / student123')
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })