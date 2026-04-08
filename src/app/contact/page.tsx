import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact & Informations — VoxSPM',
  description: 'Contact, hébergement, modération, confidentialité et mentions légales de VoxSPM, le site de sondages citoyens de Saint-Pierre-et-Miquelon.',
};

export default function ContactPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-16 sm:py-20">
      <h1 className="font-['Instrument_Serif'] text-4xl sm:text-5xl text-slate-900 leading-tight">
        Contact & Informations
      </h1>

      <p className="mt-3 text-slate-600 italic">
        VoxSPM est un projet citoyen indépendant, bénévole et sans but lucratif,
        dédié à Saint-Pierre-et-Miquelon et sa diaspora.
      </p>

      <div className="h-px bg-slate-200 my-10" />

      <h2 className="font-semibold text-lg text-slate-900 mt-10 mb-3">
        Éditeur du site
      </h2>
      <p className="text-[15px] text-slate-700 leading-relaxed">
        Équipe VoxSPM. Projet personnel édité depuis Saint-Pierre-et-Miquelon,
        à titre non commercial.
      </p>

      <h2 className="font-semibold text-lg text-slate-900 mt-10 mb-3">
        Contact
      </h2>
      <p className="text-[15px] text-slate-700 leading-relaxed">
        Pour toute question, signalement ou demande, écrire à :
      </p>
      <p className="mt-2">
        <a
          href="mailto:voxspm.contact@gmail.com"
          className="text-[#1A6FB5] hover:underline font-medium"
        >
          voxspm.contact@gmail.com
        </a>
      </p>

      <h2 className="font-semibold text-lg text-slate-900 mt-10 mb-3">
        Hébergement technique
      </h2>
      <ul className="mt-2 space-y-1 list-disc list-inside text-[15px] text-slate-700">
        <li>
          Application web : Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA
          91789, USA
        </li>
        <li>
          Base de données : Supabase Inc., 970 Toa Payoh North #07-04,
          Singapour
        </li>
      </ul>

      <div className="h-px bg-slate-200 my-10" />

      <h2 className="font-semibold text-lg text-slate-900 mt-10 mb-3">
        Modération des sondages
      </h2>
      <p className="text-[15px] text-slate-700 leading-relaxed">
        Les propositions de sondages soumises par les utilisateurs sont
        examinées avant publication dans un délai indicatif de 72 heures. Sont
        refusées les propositions non constructives, diffamatoires,
        commerciales, ciblant nominativement un individu, ou sans lien avec
        l'archipel et sa vie civique.
      </p>
      <p className="mt-3 text-[15px] text-slate-700 leading-relaxed">
        Chaque utilisateur peut soumettre jusqu'à 3 propositions en attente de
        modération simultanément. Cette limite se libère à mesure que les
        propositions sont validées ou refusées.
      </p>

      <h2 className="font-semibold text-lg text-slate-900 mt-10 mb-3">
        Signalement d'un contenu
      </h2>
      <p className="text-[15px] text-slate-700 leading-relaxed">
        Pour signaler un contenu problématique ou demander le retrait d'un
        sondage publié, écrire à{' '}
        <a
          href="mailto:voxspm.contact@gmail.com"
          className="text-[#1A6FB5] hover:underline"
        >
          voxspm.contact@gmail.com
        </a>{' '}
        en précisant le sondage concerné et la raison du signalement. Chaque
        signalement sera examiné avec attention dans les meilleurs délais.
      </p>

      <div className="h-px bg-slate-200 my-10" />

      <h2 className="font-semibold text-lg text-slate-900 mt-10 mb-3">
        Données personnelles & confidentialité
      </h2>
      <p className="text-[15px] text-slate-700 leading-relaxed">
        VoxSPM ne collecte aucune donnée permettant d'identifier directement ses
        utilisateurs. Seules sont enregistrées :
      </p>
      <ul className="mt-3 space-y-1 list-disc list-inside text-[15px] text-slate-700">
        <li>Un identifiant de session anonyme, généré techniquement</li>
        <li>
          Une géolocalisation déclarée par l'utilisateur : Saint-Pierre,
          Miquelon ou Extérieur
        </li>
        <li>Les votes enregistrés et les propositions de sondages soumises</li>
        <li>Un pseudonyme optionnel, si le proposant choisit d'en fournir un</li>
      </ul>
      <p className="mt-4 text-[15px] text-slate-700 leading-relaxed">
        Aucun cookie publicitaire, aucun traceur tiers, aucune mesure
        d'audience externe n'est utilisé. Seuls des cookies techniques
        strictement nécessaires au fonctionnement du site (session anonyme) sont
        déposés, conformément à la directive ePrivacy.
      </p>

      <h2 className="font-semibold text-lg text-slate-900 mt-10 mb-3">
        Propriété intellectuelle
      </h2>
      <p className="text-[15px] text-slate-700 leading-relaxed">
        Le code source de VoxSPM est publié en open source sur GitHub à
        l'adresse{' '}
        <a
          href="https://github.com/freedisk/voxspm"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#1A6FB5] hover:underline"
        >
          github.com/freedisk/voxspm
        </a>
        . Les contenus publiés (sondages, résultats) restent la propriété de
        leurs auteurs respectifs.
      </p>

      <h2 className="font-semibold text-lg text-slate-900 mt-10 mb-3">
        Droit applicable
      </h2>
      <p className="text-[15px] text-slate-700 leading-relaxed">
        L'utilisation du site VoxSPM est régie par le droit français. En cas de
        litige, et après tentative de résolution amiable par email, les
        tribunaux compétents de Saint-Pierre-et-Miquelon seront seuls
        compétents.
      </p>

      <p className="mt-12 text-xs text-slate-500 italic text-center">
        Dernière mise à jour : avril 2026
      </p>
    </main>
  );
}
