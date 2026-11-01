'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type Mode = 'login' | 'register' | 'forgot' | 'reset';

const TITLES: Record<Mode, string> = {
  login: 'Connexion',
  register: 'Créer un compte',
  forgot: 'Mot de passe oublié',
  reset: 'Nouveau mot de passe',
};

export default function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(''); setInfo(''); setBusy(true);
    const f = new FormData(e.currentTarget);
    const email = String(f.get('email') ?? '').trim();
    const password = String(f.get('password') ?? '');
    const supabase = createClient();
    const origin = window.location.origin;
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        const next = params.get('next');
        router.push(next && next.startsWith('/') ? next : '/account');
        router.refresh();
      } else if (mode === 'register') {
        if (password.length < 8) throw new Error('Le mot de passe doit contenir au moins 8 caractères.');
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { full_name: String(f.get('name') ?? '').trim() }, emailRedirectTo: `${origin}/auth/callback` },
        });
        if (error) throw error;
        setInfo('Compte créé. Vérifiez votre e-mail pour confirmer votre adresse.');
      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${origin}/auth/callback?next=/reset-password` });
        if (error) throw error;
        setInfo('Si cette adresse existe, un lien de réinitialisation vient d\'être envoyé.');
      } else {
        if (password.length < 8) throw new Error('Le mot de passe doit contenir au moins 8 caractères.');
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        router.push('/account');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
    } finally {
      setBusy(false);
    }
  }

  const input = 'w-full rounded border border-ink px-3 py-3';
  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <h1 className="mb-6 text-3xl font-extrabold">{TITLES[mode]}</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        {mode === 'register' && (
          <label className="block text-sm font-medium">Nom complet
            <input name="name" required autoComplete="name" className={input} />
          </label>
        )}
        {mode !== 'reset' && (
          <label className="block text-sm font-medium">E-mail
            <input name="email" type="email" required autoComplete="email" className={input} />
          </label>
        )}
        {mode !== 'forgot' && (
          <label className="block text-sm font-medium">{mode === 'reset' ? 'Nouveau mot de passe' : 'Mot de passe'}
            <input name="password" type="password" required minLength={8} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} className={input} />
          </label>
        )}
        {error && <p role="alert" className="border border-ink bg-soft p-3 text-sm">{error}</p>}
        {info && <p role="status" className="border border-ink bg-soft p-3 text-sm">{info}</p>}
        <button disabled={busy} className="w-full rounded bg-ink py-3 font-bold text-paper disabled:opacity-50">
          {busy ? 'Veuillez patienter…' : TITLES[mode]}
        </button>
      </form>
      <div className="mt-6 space-y-2 text-sm">
        {mode === 'login' && <><Link className="underline" href="/forgot-password">Mot de passe oublié ?</Link><br /><Link className="underline" href="/register">Créer un compte</Link></>}
        {mode === 'register' && <Link className="underline" href="/login">J'ai déjà un compte</Link>}
        {mode === 'forgot' && <Link className="underline" href="/login">Retour à la connexion</Link>}
      </div>
    </main>
  );
}
