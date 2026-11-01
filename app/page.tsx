import Link from 'next/link';

// Page d'accueil provisoire : le design complet (carrousel, sections produits)
// sera porté depuis le prototype HTML dans les composants de /components.
export default function Home() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-16">
      <h1 className="text-4xl font-extrabold tracking-tight md:text-6xl">Tout ce qu'il vous faut, livré chez vous.</h1>
      <p className="mt-4 max-w-xl text-graphite">Marketplace multi-catégories pour les États-Unis et Haïti, en USD et en HTG.</p>
      <div className="mt-8 flex gap-3">
        <Link href="/register" className="rounded bg-ink px-6 py-3 font-bold text-paper">Créer un compte</Link>
        <Link href="/login" className="rounded border-2 border-ink px-6 py-3 font-bold">Se connecter</Link>
      </div>
    </main>
  );
}
