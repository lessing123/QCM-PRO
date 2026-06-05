import { useEffect } from 'react'

export default function AdminGuide() {
  useEffect(() => {
    document.title = 'Guide Administrateur — QCM Pro'
  }, [])

  return (
    <>
      <div className="mb-6 print:hidden">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Guide Administrateur</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Documentation complète de la plateforme QCM Pro</p>
          </div>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-xl bg-primary-700 px-5 py-3 text-sm font-bold text-white shadow-lg hover:bg-primary-800 active:scale-95 transition-all"
          >
            <IconPrint />
            Télécharger en PDF
          </button>
        </div>
        <div className="mt-4 rounded-xl border border-primary-200 bg-primary-50 px-4 py-3 text-sm text-primary-800 dark:border-primary-500/20 dark:bg-primary-500/10 dark:text-primary-300">
          Cliquez sur <strong>Télécharger en PDF</strong> puis dans la fenêtre d'impression choisissez <strong>Enregistrer en PDF</strong> comme destination.
        </div>
      </div>

      <div className="guide-content mx-auto max-w-3xl space-y-10 rounded-2xl border border-slate-200 bg-white p-10 shadow-sm dark:border-slate-800 dark:bg-slate-900 print:border-0 print:shadow-none print:p-0">

        <header className="border-b border-slate-200 pb-8 dark:border-slate-700">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary-700 dark:text-primary-400">QCM Pro</p>
          <h2 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">Guide Administrateur</h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400">Plateforme d'examens et de suivi — Version 2.0</p>
        </header>

        <Section num="1" title="Vue d'ensemble">
          <p>QCM Pro est une plateforme d'examens en ligne permettant de créer des examens sécurisés, gérer les étudiants et classes, surveiller les sessions en temps réel et consulter les résultats.</p>
          <p className="mt-3">Modules principaux accessibles depuis la barre de navigation :</p>
          <ul className="mt-2 space-y-1 pl-5 list-disc text-slate-700 dark:text-slate-300">
            <li><strong>Tableau de bord</strong> — statistiques globales et activité récente</li>
            <li><strong>Examens</strong> — création, édition, planification et surveillance live</li>
            <li><strong>Étudiants</strong> — gestion des comptes, activation/désactivation</li>
            <li><strong>Classes</strong> — organisation des étudiants par groupe</li>
          </ul>
        </Section>

        <Section num="2" title="Gestion des examens">
          <SubSection title="Créer un examen">
            <ol className="space-y-1 pl-5 list-decimal text-slate-700 dark:text-slate-300">
              <li>Cliquer sur <em>Examens</em> dans la barre de navigation.</li>
              <li>Cliquer sur <em>Nouvel examen</em>.</li>
              <li>Remplir le titre, la durée, la description et le nombre de tentatives.</li>
              <li>Activer ou non le mélange des questions et des réponses.</li>
              <li>Configurer la planification (date de début et de fin) si nécessaire.</li>
              <li>Activer un code d'accès si souhaité (voir section dédiée).</li>
              <li>Assigner une ou plusieurs classes à l'examen.</li>
              <li>Ajouter les questions manuellement ou via import.</li>
              <li>Cliquer sur <em>Créer l'examen</em>.</li>
            </ol>
          </SubSection>

          <SubSection title="Planification de l'examen">
            <p className="text-slate-700 dark:text-slate-300">Dans le formulaire, la section <strong>Planification</strong> permet de définir une fenêtre de disponibilité :</p>
            <ul className="mt-2 space-y-1 pl-5 list-disc text-slate-700 dark:text-slate-300">
              <li><strong>Disponible à partir de</strong> — les étudiants ne peuvent pas accéder à l'examen avant cette date.</li>
              <li><strong>Disponible jusqu'à</strong> — l'examen disparaît automatiquement après cette date.</li>
              <li>Si aucune date n'est renseignée, l'examen est accessible immédiatement et sans limite.</li>
            </ul>
          </SubSection>

          <SubSection title="Code d'accès">
            <p className="text-slate-700 dark:text-slate-300">Dans le formulaire, la section <strong>Code d'accès</strong> permet de sécuriser l'entrée dans l'examen :</p>
            <ol className="mt-2 space-y-1 pl-5 list-decimal text-slate-700 dark:text-slate-300">
              <li>Cocher <em>Activer</em> pour générer un code à 6 caractères automatiquement.</li>
              <li>Communiquer ce code aux étudiants <strong>verbalement</strong> avant l'examen (ne pas l'écrire dans un chat).</li>
              <li>Les étudiants devront saisir ce code sur la page instructions avant de commencer.</li>
              <li>Utiliser le bouton <em>Copier</em> pour copier le code, ou <em>Régénérer</em> pour en créer un nouveau.</li>
            </ol>
            <p className="mt-2 text-slate-600 dark:text-slate-400 text-sm">Si un étudiant navigue en arrière depuis l'écran de saisie du code, l'incident est signalé.</p>
          </SubSection>

          <SubSection title="Types de questions">
            <ul className="space-y-1 pl-5 list-disc text-slate-700 dark:text-slate-300">
              <li><strong>SINGLE</strong> — une seule bonne réponse (choix unique)</li>
              <li><strong>MULTIPLE</strong> — plusieurs bonnes réponses possibles</li>
              <li><strong>TRUE_FALSE</strong> — vrai ou faux</li>
            </ul>
          </SubSection>

          <SubSection title="Importer des questions (Excel / CSV)">
            <p className="text-slate-700 dark:text-slate-300">Dans le formulaire, cliquer sur <em>Importer des questions</em> et choisir un fichier <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">.xlsx</code>, <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">.xls</code> ou <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">.csv</code>.</p>
            <p className="mt-3 font-semibold text-slate-800 dark:text-slate-200">Format requis (colonnes en 1ère ligne) :</p>
            <div className="mt-2 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800">
                  <tr>
                    {['enonce', 'type', 'points', 'ordre', 'answers'].map(h => (
                      <th key={h} className="px-4 py-2 text-left font-semibold text-slate-700 dark:text-slate-300">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-slate-100 dark:border-slate-800">
                    <td className="px-4 py-2 text-slate-600 dark:text-slate-400">Quelle est la capitale ?</td>
                    <td className="px-4 py-2 text-slate-600 dark:text-slate-400">SINGLE</td>
                    <td className="px-4 py-2 text-slate-600 dark:text-slate-400">2</td>
                    <td className="px-4 py-2 text-slate-600 dark:text-slate-400">1</td>
                    <td className="px-4 py-2 text-slate-600 dark:text-slate-400">Paris*|Londres|Berlin</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-slate-700 dark:text-slate-300">Les réponses sont séparées par <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">|</code>. Marquer la bonne réponse avec <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">*</code> (ex : <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">Paris*</code>).</p>
          </SubSection>
        </Section>

        <Section num="3" title="Surveillance live">
          <p className="text-slate-700 dark:text-slate-300">Le bouton <strong>● Live</strong> sur chaque examen ouvre la vue de surveillance en temps réel.</p>
          <SubSection title="Ce qu'affiche la page Live">
            <ul className="space-y-1 pl-5 list-disc text-slate-700 dark:text-slate-300">
              <li><strong>Compteurs globaux</strong> — inscrits, connectés, en cours, terminés.</li>
              <li><strong>Graphique par classe</strong> — barres comparant inscrits / connectés / en cours / terminés pour chaque classe.</li>
              <li><strong>Liste détaillée</strong> — chaque étudiant avec un point vert (connecté) ou gris (absent) et son statut (En cours / Terminé / Bloqué).</li>
            </ul>
          </SubSection>
          <SubSection title="Rafraîchissement">
            <p className="text-slate-700 dark:text-slate-300">La page se met à jour <strong>automatiquement toutes les 5 secondes</strong>. Un bouton <em>Actualiser</em> permet une mise à jour manuelle immédiate.</p>
          </SubSection>
        </Section>

        <Section num="4" title="Gestion des étudiants">
          <SubSection title="Ajouter un étudiant">
            <ol className="space-y-1 pl-5 list-decimal text-slate-700 dark:text-slate-300">
              <li>Aller dans <em>Étudiants</em>.</li>
              <li>Cliquer sur <em>Ajouter un étudiant</em>.</li>
              <li>Remplir nom, prénom, email et assigner une classe.</li>
              <li>Un mot de passe temporaire est automatiquement généré.</li>
              <li>L'étudiant devra le changer à sa première connexion.</li>
            </ol>
          </SubSection>

          <SubSection title="Import en masse (CSV)">
            <p className="text-slate-700 dark:text-slate-300">Cliquer sur <em>Importer</em> et sélectionner un fichier CSV au format :</p>
            <pre className="mt-2 rounded-xl bg-slate-50 p-4 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-300">nom,prenom,email{'\n'}Doe,John,john.doe@exemple.com{'\n'}Smith,Jane,jane.smith@exemple.com</pre>
            <p className="mt-2 text-slate-700 dark:text-slate-300">Il est possible d'assigner directement une classe lors de l'import.</p>
          </SubSection>

          <SubSection title="Activer / Désactiver un compte">
            <p className="text-slate-700 dark:text-slate-300">Dans la liste des étudiants, chaque compte affiche un badge <strong>Actif</strong> (vert) ou <strong>Désactivé</strong> (rouge). Cliquer sur ce badge bascule l'état immédiatement.</p>
            <p className="mt-2 text-slate-600 dark:text-slate-400 text-sm">Un compte désactivé ne peut plus se connecter. Utile pour suspendre temporairement un accès sans supprimer le compte.</p>
          </SubSection>

          <SubSection title="Suppression en masse">
            <p className="text-slate-700 dark:text-slate-300">Cocher plusieurs étudiants via les cases à gauche, puis cliquer sur <em>Supprimer (N)</em> pour les supprimer simultanément.</p>
          </SubSection>

          <SubSection title="Réinitialiser un mot de passe">
            <p className="text-slate-700 dark:text-slate-300">Cliquer sur l'icône de réinitialisation en face de l'étudiant. Un nouveau mot de passe temporaire est généré.</p>
          </SubSection>
        </Section>

        <Section num="5" title="Résultats et statistiques">
          <SubSection title="Consulter les résultats">
            <p className="text-slate-700 dark:text-slate-300">Depuis la liste des examens, cliquer sur <em>Résultats</em> pour voir les notes de chaque étudiant, les tentatives et les statistiques (moyenne, min, max).</p>
          </SubSection>

          <SubSection title="Publier les notes">
            <p className="text-slate-700 dark:text-slate-300">Par défaut, les notes ne sont pas visibles par les étudiants. Cliquer sur <em>Publier les notes</em> pour les rendre accessibles dans leur historique. Ce bouton est réversible.</p>
          </SubSection>

          <SubSection title="Export PDF">
            <p className="text-slate-700 dark:text-slate-300">Cliquer sur <em>Exporter PDF</em> génère un fichier PDF directement dans le navigateur avec :</p>
            <ul className="mt-2 space-y-1 pl-5 list-disc text-slate-700 dark:text-slate-300">
              <li>Tableau des statistiques globales (moyenne, min, max)</li>
              <li>Liste complète des étudiants avec leur score en couleur (vert ≥ 10, rouge &lt; 10)</li>
              <li>Date de génération et titre de l'examen</li>
            </ul>
          </SubSection>

          <SubSection title="Export CSV">
            <p className="text-slate-700 dark:text-slate-300">Cliquer sur <em>Exporter CSV</em> télécharge un fichier tableur compatible Excel.</p>
          </SubSection>
        </Section>

        <Section num="6" title="Système anti-triche et notifications">
          <SubSection title="Notifications en temps réel">
            <p className="text-slate-700 dark:text-slate-300">La cloche en haut à droite affiche les incidents en temps réel :</p>
            <ul className="mt-2 space-y-1 pl-5 list-disc text-slate-700 dark:text-slate-300">
              <li><strong>Changement d'onglet / fenêtre</strong> — l'étudiant a quitté la page d'examen.</li>
              <li><strong>Rechargement / fermeture</strong> — l'étudiant a rafraîchi ou fermé la page.</li>
              <li><strong>Examen terminé</strong> — notification dès qu'un étudiant soumet son examen.</li>
            </ul>
          </SubSection>

          <SubSection title="Bloquer / Débloquer un étudiant">
            <p className="text-slate-700 dark:text-slate-300">Depuis une notification d'incident, cliquer sur <em>Débloquer</em> pour autoriser l'étudiant à reprendre son examen. L'examen est suspendu (avec pause du chronomètre) jusqu'au déblocage.</p>
          </SubSection>

          <SubSection title="Mesures actives sur les étudiants">
            <ul className="space-y-1 pl-5 list-disc text-slate-700 dark:text-slate-300">
              <li>Plein écran obligatoire — quitter le plein écran déclenche un incident.</li>
              <li>Changement d'onglet ou de fenêtre — détecté et signalé.</li>
              <li>Boutons ← → du navigateur — bloqués, toute tentative est signalée.</li>
              <li>Partage d'écran — interdit et bloqué automatiquement.</li>
              <li>Un seul appareil connecté par compte étudiant à la fois.</li>
            </ul>
          </SubSection>
        </Section>

        <Section num="7" title="Gestion des classes">
          <p className="text-slate-700 dark:text-slate-300">Les classes regroupent les étudiants et permettent d'assigner des examens à des groupes spécifiques.</p>
          <ol className="mt-3 space-y-1 pl-5 list-decimal text-slate-700 dark:text-slate-300">
            <li>Aller dans <em>Classes</em>.</li>
            <li>Créer une classe avec un nom et une description.</li>
            <li>Affecter des étudiants à la classe depuis la fiche étudiant ou lors de l'import CSV.</li>
            <li>Lors de la création d'un examen, sélectionner les classes concernées.</li>
          </ol>
        </Section>

        <Section num="8" title="Paramètres du compte">
          <p className="text-slate-700 dark:text-slate-300">Accessible via l'icône <em>Paramètres</em> dans la barre de navigation. Permet de modifier le mot de passe administrateur. Il est recommandé d'utiliser un mot de passe d'au moins 8 caractères combinant lettres, chiffres et symboles.</p>
          <p className="mt-2 text-slate-600 dark:text-slate-400 text-sm">Un compte administrateur peut avoir jusqu'à <strong>3 sessions simultanées</strong> actives.</p>
        </Section>

        <footer className="border-t border-slate-200 pt-6 text-center text-xs text-slate-400 dark:border-slate-700">
          QCM Pro — Guide Administrateur v2.0 · Tous droits réservés
        </footer>
      </div>

      <style>{`
        @media print {
          body { background: white; }
          .print\\:hidden { display: none !important; }
          .guide-content { max-width: 100%; border: none; box-shadow: none; padding: 0; }
        }
      `}</style>
    </>
  )
}

function Section({ num, title, children }: { num: string; title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h3 className="flex items-center gap-3 text-xl font-bold text-slate-900 dark:text-white">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-700 text-sm font-bold text-white">{num}</span>
        {title}
      </h3>
      <div className="pl-11 space-y-4">{children}</div>
    </section>
  )
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h4 className="font-semibold text-slate-800 dark:text-slate-200">{title}</h4>
      {children}
    </div>
  )
}

const IconPrint = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
  </svg>
)
