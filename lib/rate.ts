import { cache } from 'react';
import { sbPublic } from './supabase/public';

// Taux HTG pour 1 USD, modifiable dans Supabase (table exchange_rates, ligne HTG). Repli : 131.
export const getRate = cache(async (): Promise<number> => {
  try {
    const { data } = await sbPublic().from('exchange_rates').select('rate_per_usd').eq('currency', 'HTG').limit(1);
    const r = Number(((data ?? []) as { rate_per_usd: number | string }[])[0]?.rate_per_usd);
    return Number.isFinite(r) && r > 0 ? r : 131;
  } catch {
    return 131;
  }
});
