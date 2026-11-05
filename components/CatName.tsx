'use client';
import { useStore } from './Store';
import type { Cat } from '@/lib/categories';

// Nom de catégorie dans la langue choisie (FR par défaut, EN si name_en est renseigné).
export default function CatName({ c }: { c: Cat }) {
  const { lang } = useStore();
  return <>{lang === 'en' && c.nameEn ? c.nameEn : c.name}</>;
}
