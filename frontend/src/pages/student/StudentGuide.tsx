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
          <p className="mt-2 text-slate-500 dark:text-slate-400">Plateforme d'examens et de suivi — Version 1.0</p>
        </header>

        <Section num="1" title="Connexion à la plateforme">
          <p>Pour accéder à la plateforme, rendez-vous sur l'URL fournie par votre professeur et connectez-vous avec votre adresse email et votre mot de passe.</p>
          <SubSection title="Première connexion">
            <ol className="space-y-1 pl-5 list-decimal text-slate-700 dark:text-slate-300">
              <li>Saisissez l'email et le mot de passe temporaire communiqués par votre administrateur.</li>
              <li>Vous serez automatiquement redirigé vers la page de changement de mot de passe.</li>
              <li>Choisissez un nouveau mot de passe personnel d'au moins 6 caractères.</li>
              <li>Confirmez-le et validez. Vous accédez ensuite à votre tableau de bord.</li>
            </ol>
          </SubSection>
          <SubSection title="Mot de passe oublié">
            <p className="text-slate-700 dark:text-slate-300">Contactez votre professeur ou administrateur pour qu'il réinitialise votre mot de passe. Un mot de passe temporaire vous sera communiqué.</p>
          </SubSection>
        </Section>

        <Section num="2" title="Tableau de bord">
          <p className="text-slate-700 dark:text-slate-300">Après connexion, vous arrivez sur votre tableau de bord qui affiche :</p>
          <ul className="mt-2 space-y-1 pl-5 list-disc text-slate-700 dark:text-slate-300">
            <li><strong>Examens disponibles</strong> — les examens que vous pouvez passer dès maintenant.</li>
            <li><strong>Examens terminés</strong> — les examens pour lesquels vous avez épuisé vos tentatives.</li>
          </ul>
          <p className="mt-3 text-slate-700 dark:text-slate-300">Utilisez le bouton <em>Historique</em> pour consulter toutes vos tentatives passées.</p>
        </Section>

        <Section num="3" title="Passer un examen">
          <SubSection title="Démarrer">
            <ol className="space-y-1 pl-5 list-decimal text-slate-700 dark:text-slate-300">
              <li>Cliquez sur un examen disponible depuis votre tableau de bord.</li>
              <li>Lisez attentivement les instructions : durée, nombre de questions, tentatives autorisées.</li>
              <li>Cliquez sur <em>Commencer l'examen</em> quand vous êtes prêt. Le chronomètre démarre immédiatement.</li>
            </ol>
          </SubSection>
          <SubSection title="Pendant l'examen">
            <ul className="space-y-1 pl-5 list-disc text-slate-700 dark:text-slate-300">
              <li>Répondez à chaque question en cochant la ou les réponses qui vous semblent correctes.</li>
              <li>Le chronomètre en haut de l'écran indique le temps restant.</li>
              <li>Vous pouvez naviguer entre les questions librement.</li>
              <li>Ne fermez pas l'onglet ni le navigateur pendant l'examen — votre tentative serait comptabilisée.</li>
              <li>À la fin du temps imparti, l'examen est automatiquement soumis.</li>
            </ul>
          </SubSection>
          <SubSection title="Soumettre">
            <p className="text-slate-700 dark:text-slate-300">Cliquez sur <em>Terminer l'examen</em> une fois toutes vos réponses renseignées. Une confirmation vous sera demandée avant soumission définitive.</p>
          </SubSection>
        </Section>

        <Section num="4" title="Après l'examen">
          <SubSection title="Récapitulatif de vos réponses">
            <p className="text-slate-700 dark:text-slate-300">Immédiatement après l'examen, vous accédez au récapitulatif qui affiche <strong>uniquement vos réponses</strong>. Les bonnes réponses ne sont pas affichées.</p>
          </SubSection>
          <SubSection title="Note et résultats">
            <p className="text-slate-700 dark:text-slate-300">Votre note sur 20 s'affiche dès que votre professeur la publie. Jusqu'à ce moment, la mention <em>Note en attente</em> apparaît à la place du score.</p>
          </SubSection>
          <SubSection title="Historique">
            <p className="text-slate-700 dark:text-slate-300">Consultez toutes vos tentatives passées depuis l'onglet <em>Historique</em> dans la barre de navigation. Vous y retrouvez vos scores et les détails de chaque examen.</p>
          </SubSection>
        </Section>

        <Section num="5" title="Règles importantes">
          <ul className="space-y-2 pl-5 list-disc text-slate-700 dark:text-slate-300">
            <li>Chaque examen a un nombre maximum de tentatives fixé par votre professeur.</li>
            <li>Le chronomètre tourne en continu — même si vous quittez la page.</li>
            <li>Toute tentative commencée est comptabilisée, même sans soumission manuelle.</li>
            <li>Les réponses correctes ne sont jamais affichées à la fin de l'examen.</li>
            <li>En cas de problème technique, prévenez immédiatement votre professeur.</li>
          </ul>
        </Section>

        <footer className="border-t border-slate-200 pt-6 text-center text-xs text-slate-400 dark:border-slate-700">
          QCM Pro — Guide Étudiant v1.0 · Tous droits réservés
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
