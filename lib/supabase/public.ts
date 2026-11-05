import { createClient } from '@supabase/supabase-js';

// Client public (clé publishable) : la sécurité repose sur les règles RLS (seuls les produits actifs sont lisibles).
export const sbPublic = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, { auth: { persistSession: false } });
