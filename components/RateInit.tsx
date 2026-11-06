'use client';
import { setRate } from '@/lib/data';

// Applique le taux lu en base avant le rendu des prix (serveur et navigateur).
export default function RateInit({ rate }: { rate: number }) {
  setRate(rate);
  return null;
}
