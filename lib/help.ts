// Pages d’aide (livraison, paiements, retours) : contenu FR/EN. Les informations reprennent celles déjà affichées sur le site ;
// les délais restent provisoires et le délai de retour (14 jours) est à confirmer par AMIRCAL.
export type HelpSection = { id?: string; h: string; p: string };
export type HelpDoc = { title: string; intro: string; sections: HelpSection[] };
export const HELP_SLUGS = ['livraison', 'paiements', 'retours'] as const;

export const HELP: Record<string, { fr: HelpDoc; en: HelpDoc }> = {
  livraison: {
    fr: {
      title: 'Livraison',
      intro: 'Nous livrons aux États-Unis et en Haïti. Le suivi de colis est inclus.',
      sections: [
        { h: 'Zones et délais', p: 'États-Unis : 7 à 14 jours. Haïti : 14 à 25 jours. Ces délais sont provisoires et seront confirmés avec le fournisseur.' },
        { h: 'Frais de livraison', p: 'La livraison est offerte dès 50 $ d’achats. Les frais éventuels sont affichés dans votre panier avant le paiement.' },
        { id: 'suivi', h: 'Suivi de colis', p: 'Un numéro de suivi est ajouté à votre commande dès l’expédition. Vous le retrouvez dans votre compte.' },
      ],
    },
    en: {
      title: 'Shipping',
      intro: 'We ship to the United States and Haiti. Package tracking is included.',
      sections: [
        { h: 'Areas and delivery times', p: 'United States: 7 to 14 days. Haiti: 14 to 25 days. These times are provisional and will be confirmed with the supplier.' },
        { h: 'Shipping costs', p: 'Shipping is free on orders over $50. Any shipping cost is shown in your cart before payment.' },
        { id: 'suivi', h: 'Package tracking', p: 'A tracking number is added to your order as soon as it ships. You can find it in your account.' },
      ],
    },
  },
  paiements: {
    fr: {
      title: 'Paiements sécurisés',
      intro: 'Votre paiement est traité par un prestataire externe sécurisé.',
      sections: [
        { h: 'Sécurité', p: 'Aucune carte bancaire n’est stockée sur AMIRCAL : les informations de paiement sont gérées directement par le prestataire de paiement.' },
        { h: 'Devises', p: 'Les prix peuvent être affichés en USD ou en HTG. La devise de paiement dépend du prestataire de paiement activé.' },
      ],
    },
    en: {
      title: 'Secure payments',
      intro: 'Your payment is processed by a secure external provider.',
      sections: [
        { h: 'Security', p: 'No bank card is stored on AMIRCAL: payment details are handled directly by the payment provider.' },
        { h: 'Currencies', p: 'Prices can be shown in USD or HTG. The payment currency depends on the payment provider that is enabled.' },
      ],
    },
  },
  retours: {
    fr: {
      title: 'Retours',
      intro: 'Retours sous 14 jours.',
      sections: [
        { h: 'Délai de retour', p: 'Vous disposez de 14 jours après la réception de votre commande pour demander le retour d’un article.' },
        { h: 'Comment faire', p: 'Contactez le service client avec votre numéro de commande : nous vous répondons au plus vite.' },
      ],
    },
    en: {
      title: 'Returns',
      intro: 'Returns within 14 days.',
      sections: [
        { h: 'Return period', p: 'You have 14 days after receiving your order to request the return of an item.' },
        { h: 'How to return an item', p: 'Contact customer service with your order number: we will get back to you as soon as possible.' },
      ],
    },
  },
};
