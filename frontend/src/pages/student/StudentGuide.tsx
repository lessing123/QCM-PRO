import { useEffect } from 'react'

export default function StudentGuide() {
  useEffect(() => {
    document.title = 'Guide Étudiant — QCM Pro'
  }, [])

  return (
    <>
      <div className="mb-6 print:hidden">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Guide Étudiant</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Tout ce qu'il faut savoir pour passer vos examens sur QCM Pro</p>
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
          Cliquez sur <strong>Télécharger en PDF</strong> puis choisissez <strong>Enregistrer en PDF</strong> comme destination d'impression.
        </div>
      </div>

      <div className="guide-content mx-auto max-w-3xl space-y-10 rounded-2xl border border-slate-200 bg-white p-10 shadow-sm dark:border-slate-800 dark:bg-slate-900 print:border-0 print:shadow-none print:p-0">

        <header className="border-b border-slate-200 pb-8 dark:border-slate-700">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary-700 dark:text-primary-400">QCM Pro</p>
          <h2 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">Guide Étudiant</h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400">Plateforme d'examens et de suivi — Version 2.0</p>
        </header>

        <Section num="1" title="Connexion à la plateforme">
          <p>Rendez-vous sur l'URL fournie par votre professeur et connectez-vous avec votre adresse email et votre mot de passe.</p>
          <SubSection title="Première connexion">
            <ol className="space-y-1 pl-5 list-decimal text-slate-700 dark:text-slate-300">
              <li>Saisissez l'email et le mot de passe temporaire communiqués par votre administrateur.</li>
              <li>Vous serez automatiquement redirigé vers la page de changement de mot de passe.</li>
              <li>Choisissez un nouveau mot de passe personnel d'au moins 6 caractères.</li>
              <li>Confirmez-le et validez. Vous accédez ensuite à votre tableau de bord.</li>
            </ol>
          </SubSection>
          <SubSection title="Connexion unique">
            <p className="text-slate-700 dark:text-slate-300">Un seul appareil peut être connecté à votre compte à la fois. Si vous vous connectez depuis un deuxième appareil, la première session est <strong>automatiquement déconnectée</strong>.</p>
          </SubSection>
          <SubSection title="Compte désactivé">
            <p className="text-slate-700 dark:text-slate-300">Si votre compte a été désactivé par l'administrateur, un message vous l'indique à la connexion. Contactez votre professeur pour rétablir l'accès.</p>
          </SubSection>
          <SubSection title="Mot de passe oublié">
            <p className="text-slate-700 dark:text-slate-300">Contactez votre professeur ou administrateur pour une réinitialisation. Un mot de passe temporaire vous sera communiqué.</p>
          </SubSection>
        </Section>

        <Section num="2" title="Tableau de bord">
          <p className="text-slate-700 dark:text-slate-300">Après connexion, votre tableau de bord affiche :</p>
          <ul className="mt-2 space-y-1 pl-5 list-disc text-slate-700 dark:text-slate-300">
            <li><strong>Examens disponibles</strong> — les examens auxquels vous pouvez accéder maintenant.</li>
            <li><strong>Examens planifiés</strong> — examens avec une date d'ouverture future.</li>
            <li><strong>Examens terminés</strong> — examens pour lesquels vous avez épuisé vos tentatives.</li>
          </ul>
          <p className="mt-3 text-slate-700 dark:text-slate-300">Utilisez l'onglet <em>Historique</em> pour consulter toutes vos tentatives passées avec les scores publiés.</p>
        </Section>

        <Section num="3" title="Passer un examen">
          <SubSection title="Code d'accès">
            <p className="text-slate-700 dark:text-slate-300">Certains examens nécessitent un <strong>code d'accès à 6 caractères</strong> communiqué oralement par votre professeur avant l'examen.</p>
            <ul className="mt-2 space-y-1 pl-5 list-disc text-slate-700 dark:text-slate-300">
              <li>Sur la page des instructions, un champ de saisie apparaît si un code est requis.</li>
              <li>Saisissez le code en majuscules et cliquez sur <em>Valider le code</em>.</li>
              <li>En cas d'erreur, vérifiez le code avec votre professeur.</li>
            </ul>
          </SubSection>

          <SubSection title="Plein écran obligatoire">
            <p className="text-slate-700 dark:text-slate-300">Lorsque vous cliquez sur <em>Commencer en plein écran</em>, le navigateur passe en mode plein écran. <strong>Il est interdit de quitter ce mode pendant l'examen.</strong></p>
            <ul className="mt-2 space-y-1 pl-5 list-disc text-slate-700 dark:text-slate-300">
              <li>Quitter le plein écran (touche Échap, etc.) déclenche un incident signalé à votre professeur.</li>
              <li>Un bouton <em>Retour en plein écran</em> apparaît pour reprendre l'examen.</li>
            </ul>
          </SubSection>

          <SubSection title="Pendant l'examen">
            <ul className="space-y-1 pl-5 list-disc text-slate-700 dark:text-slate-300">
              <li>Répondez à chaque question en cochant la ou les réponses correctes.</li>
              <li>Le chronomètre en haut indique le temps restant.</li>
              <li>Naviguez librement entre les questions via les boutons ou les points en bas.</li>
              <li>Vos réponses sont <strong>sauvegardées automatiquement</strong> — même en cas de perte de connexion temporaire.</li>
              <li>À la fin du temps imparti, l'examen est soumis <strong>automatiquement</strong>.</li>
            </ul>
          </SubSection>

          <SubSection title="Vérification avant soumission">
            <p className="text-slate-700 dark:text-slate-300">En cliquant sur <em>Soumettre l'examen</em>, vous accédez à un <strong>écran de vérification</strong> avant la soumission définitive :</p>
            <ul className="mt-2 space-y-1 pl-5 list-disc text-slate-700 dark:text-slate-300">
              <li>Toutes vos réponses sont listées avec leur texte sélectionné.</li>
              <li>Les questions sans réponse sont mises en évidence en orange avec un lien direct pour y retourner.</li>
              <li>Cliquer sur <em>Confirmer la soumission</em> valide définitivement l'examen.</li>
            </ul>
            <p className="mt-2 text-slate-600 dark:text-slate-400 text-sm">Prenez le temps de vérifier chaque réponse avant de confirmer — c'est irréversible.</p>
          </SubSection>
        </Section>

        <Section num="4" title="Après l'examen">
          <SubSection title="Récapitulatif de vos réponses">
            <p className="text-slate-700 dark:text-slate-300">Immédiatement après l'examen, vous accédez au récapitulatif qui affiche <strong>uniquement vos réponses sélectionnées</strong>. Les bonnes réponses ne sont jamais affichées.</p>
          </SubSection>
          <SubSection title="Note et résultats">
            <p className="text-slate-700 dark:text-slate-300">Votre note sur 20 s'affiche dès que votre professeur la publie. Jusqu'à ce moment, la mention <em>Terminé</em> apparaît à la place du score dans votre historique.</p>
          </SubSection>
          <SubSection title="Historique">
            <p className="text-slate-700 dark:text-slate-300">Consultez toutes vos tentatives passées depuis l'onglet <em>Historique</em> dans la barre de navigation.</p>
          </SubSection>
        </Section>

        <Section num="5" title="Système de sécurité">
          <p className="text-slate-700 dark:text-slate-300">La plateforme dispose d'un <strong>système de sécurité de très haut niveau</strong>. Tout comportement suspect est signalé en temps réel à votre professeur et peut entraîner la suspension immédiate de votre examen.</p>
          <ul className="mt-3 space-y-2 pl-5 list-disc text-slate-700 dark:text-slate-300">
            <li><strong>Plein écran</strong> — quitter le plein écran pendant l'examen est détecté et signalé.</li>
            <li><strong>Changement d'onglet ou de fenêtre</strong> — toute navigation hors de la page d'examen est détectée.</li>
            <li><strong>Boutons ← → du navigateur</strong> — désactivés pendant l'examen.</li>
            <li><strong>Rechargement de la page (F5)</strong> — entraîne la suspension de votre examen.</li>
            <li><strong>Partage d'écran</strong> — interdit et bloqué automatiquement par le navigateur.</li>
            <li><strong>Session unique</strong> — un seul appareil connecté à la fois ; toute connexion depuis un autre appareil vous déconnecte.</li>
            <li><strong>Suspension</strong> — en cas d'incident, votre examen est gelé et le chronomètre s'arrête jusqu'au déblocage par votre professeur. Votre progression est conservée.</li>
          </ul>
        </Section>

        <Section num="6" title="Conseils pratiques">
          <ul className="space-y-2 pl-5 list-disc text-slate-700 dark:text-slate-300">
            <li>Utilisez un ordinateur avec une connexion Internet stable.</li>
            <li>Fermez tous les autres onglets et applications avant de commencer.</li>
            <li>Mémorisez le code d'accès communiqué par votre professeur — ne le partagez pas.</li>
            <li>En cas de coupure réseau, vos réponses sont sauvegardées localement et resynchronisées automatiquement à la reconnexion.</li>
            <li>En cas de problème technique, signalez-le immédiatement à votre professeur avant de tenter toute manipulation.</li>
          </ul>
        </Section>

        <footer className="border-t border-slate-200 pt-6 text-center text-xs text-slate-400 dark:border-slate-700">
          QCM Pro — Guide Étudiant v2.0 · Tous droits réservés
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
