import Link from 'next/link';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className='mt-8 bg-ink text-paper'>
      <div className='mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-8 text-sm leading-8 md:grid-cols-4'>
        <div className='col-span-2 md:col-span-1'><Logo className='mb-2 h-10' />Marketplace internationale.<br />États-Unis · Haïti</div>
        <div><b className='block'>Aide</b>Suivi de commande<br />Livraison<br />Retours</div>
        <div><b className='block'>Compte</b><Link href='/login'>Connexion</Link><br /><Link href='/wishlist'>Favoris</Link><br /><Link href='/cart'>Panier</Link></div>
        <div><b className='block'>Devises</b>USD · HTG<br />Paiement sécurisé</div>
      </div>
      <p className='border-t border-neutral-700 px-4 py-4 text-center text-xs text-neutral-400'>© AMIRCAL. Tous droits réservés.</p>
    </footer>
  );
}
