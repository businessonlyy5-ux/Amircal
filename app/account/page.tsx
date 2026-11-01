import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const metadata = { title: 'Mon compte' };

async function signOut() {
  'use server';
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

export default async function Account() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { data: profile } = await supabase.from('profiles').select('full_name, role, country').eq('id', user.id).single();
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-extrabold">Bonjour{profile?.full_name ? `, ${profile.full_name}` : ''}</h1>
      <p className="mt-1 text-graphite">{user.email}</p>
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {['Mes commandes', 'Suivi de commande', 'Adresses enregistrées', 'Liste de favoris', 'Profil'].map((t) => (
          <div key={t} className="rounded border border-ink p-4 font-medium">{t}<span className="block text-xs text-graphite">Bientôt disponible</span></div>
        ))}
      </div>
      {profile?.role !== 'customer' && <p className="mt-6 text-sm">Rôle : {profile?.role}</p>}
      <form action={signOut} className="mt-8"><button className="rounded border-2 border-ink px-5 py-2 font-bold">Se déconnecter</button></form>
    </main>
  );
}
