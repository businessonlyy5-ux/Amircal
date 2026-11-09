'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { formatMoney, VARIANTS, type Product } from '@/lib/data';
import { parseDescription } from '@/lib/details';
import { LOW_STOCK } from '@/lib/stock';
import { useStore } from './Store';
import { useProductsByIds } from './useProducts';
import { BoxIcon } from './Icons';
import BeforeAfter from './BeforeAfter';
import ProductCard from './ProductCard';

const PERKS = [
  { t: 'Suivi de commande', d: 'Numéro de suivi dès l’expédition' },
  { t: 'Paiement sécurisé', d: 'Aucune carte stockée sur AMIRCAL' },
  { t: 'USD et HTG', d: 'Prix affichés dans votre devise' },
  { t: 'Service client', d: 'Une équipe pour vous aider' },
];
const FAQ = [
  ['Quand vais-je recevoir ma commande ?', 'États-Unis : 7 à 14 jours. Haïti : 14 à 25 jours. Délais provisoires, confirmés avec le fournisseur.'],
  ['Comment suivre mon colis ?', 'Un numéro de suivi est ajouté à votre commande dès l’expédition, visible dans votre compte.'],
  ['Puis-je payer en gourdes (HTG) ?', 'Les prix peuvent être affichés en HTG. La devise de paiement dépend du prestataire de paiement activé.'],
  ['Que faire si j’ai un problème avec ma commande ?', 'Contactez le service client avec votre numéro de commande : nous vous répondons au plus vite.'],
];

function Thumb({ p, className = 'h-1/3 w-1/3' }: { p: Product; className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return p.image ? <img src={p.image} alt={p.name} loading='lazy' className='h-full w-full object-contain' /> : <BoxIcon className={className} />;
}

// reviews : carrousel d’avis (serveur) ; summary : moyenne et nombre d’avis publiés pour ce produit (sample : avis d’exemple) ;
// upsell : articles qui complètent ce produit (ex. oreiller -> masque de sommeil), choisis côté serveur ;
// beforeAfter : photos avant / après déposées dans public/avant-apres (affichées seulement si les deux existent) ;
// demoStock : le stock affiché est un niveau d’exemple (mode démonstration) — signalé par une mention discrète.
export default function ProductDetail({ p, related, upsell, beforeAfter, demoStock, reviews, summary }: { p: Product; related: Product[]; upsell?: Product[]; beforeAfter?: { before: string; after: string } | null; demoStock?: boolean; reviews?: React.ReactNode; summary?: { avg: number; count: number; sample?: boolean } }) {
  const router = useRouter();
  const { currency, add, cart } = useStore();
  const real = !!p.image; // produits Zendrop : variantes réelles ; sans image = produit de démonstration (couleurs/tailles fictives)
  const imgs = p.images?.length ? p.images : p.image ? [p.image] : [];
  const [img, setImg] = useState(0);
  const [color, setColor] = useState(VARIANTS.Couleur[0]);
  const [size, setSize] = useState(VARIANTS.Taille[1]);
  const [qty, setQty] = useState(1);
  const [seenIds, setSeenIds] = useState<number[]>([]);

  // Description du fournisseur mise en forme : points forts, paragraphes, mode d’emploi, ingrédients.
  const parsed = useMemo(() => parseDescription(p.description, p.name), [p.description, p.name]);
  const paras = parsed.paragraphs.length ? parsed.paragraphs : p.description && p.description !== p.name && !parsed.points.length ? [p.description] : [];
  const detailCards = parsed.points.filter((x) => x.text);

  // Variantes Zendrop réelles : un groupe de choix par option (Couleur, Taille…).
  const vs = useMemo(() => p.variants ?? [], [p.variants]);
  const groups = useMemo(() => {
    const g: Record<string, string[]> = {};
    for (const v of vs) for (const [k, val] of Object.entries(v.options)) { const a = (g[k] ??= []); if (!a.includes(val)) a.push(val); }
    return g;
  }, [vs]);
  const [sel, setSel] = useState<Record<string, string>>(() => ({ ...(vs[0]?.options ?? {}) }));
  const pick = (k: string, val: string) => {
    const next = { ...sel, [k]: val };
    const exact = vs.find((v) => Object.entries(next).every(([a, b]) => v.options[a] === b));
    setSel(exact ? exact.options : (vs.find((v) => v.options[k] === val)?.options ?? next)); // combinaison absente : on garde la valeur choisie et on adapte les autres options
  };
  const chosen = vs.find((v) => Object.entries(sel).every(([a, b]) => v.options[a] === b));
  const variant = real ? (chosen?.label || 'Standard') : color + ' / ' + size;
  const out = p.stock === 0;
  const low = p.stock > 0 && p.stock <= LOW_STOCK; // alerte de stock bas
  const maxQty = Math.max(1, Math.min(10, p.stock || 10));

  // Articles complémentaires en priorité ; à défaut, les produits de la même catégorie.
  const hasUpsell = !!upsell?.length;
  const bundle = useMemo(() => (upsell?.length ? [p, ...upsell.slice(0, 3)] : [p, ...related.slice(0, 2)]), [p, related, upsell]);
  const [picked, setPicked] = useState<number[]>(bundle.map((b) => b.id));
  useEffect(() => { setPicked(bundle.map((b) => b.id)); }, [bundle]);
  const bundleTotal = bundle.filter((b) => picked.includes(b.id)).reduce((s, b) => s + b.price, 0);

  useEffect(() => {
    try {
      const prev: number[] = JSON.parse(localStorage.getItem('amircal_seen') ?? '[]');
      setSeenIds(prev.filter((id) => id !== p.id).slice(0, 8));
      localStorage.setItem('amircal_seen', JSON.stringify([p.id, ...prev.filter((id) => id !== p.id)].slice(0, 12)));
    } catch { /* stockage indisponible */ }
  }, [p.id]);

  const { get } = useProductsByIds([...cart.map((l) => l.id), ...seenIds]);
  const seen = seenIds.map(get).filter((x): x is Product => !!x);
  const threshold = currency === 'USD' ? 50 : 100;
  const cartSub = cart.reduce((s, l) => s + (get(l.id)?.price ?? 0) * l.qty, 0);
  const left = Math.max(0, threshold - cartSub);
  const chip = (on: boolean) => 'mr-1.5 mb-1.5 rounded border px-3.5 py-2 text-sm ' + (on ? 'border-ink bg-ink text-paper' : 'border-neutral-400');
  const buy = () => { add(p.id, qty, variant); };
  const bundleVariant = (b: Product) => (b.image ? 'Standard' : b.id === p.id ? variant : 'Noir / M');

  return (
    <main className='mx-auto max-w-7xl px-4 pb-24 pt-4 md:pb-8'>
      <div className='mb-3 border border-neutral-200 bg-soft px-3 py-2 text-xs md:text-sm'>
        {cartSub === 0 ? <>Livraison offerte dès <b>{formatMoney(threshold, currency)}</b> d’achats</> : left > 0 ? <>Plus que <b>{formatMoney(left, currency)}</b> pour la livraison offerte</> : <b>Livraison offerte sur votre panier</b>}
        <div className='mt-1.5 h-1.5 w-full bg-neutral-300'><div className='h-full bg-ink transition-all' style={{ width: Math.min(100, (cartSub / threshold) * 100) + '%' }} /></div>
      </div>
      <p className='mb-3 text-xs text-neutral-600'><Link href='/products' className='underline'>Catalogue</Link> / <Link href={'/products?cat=' + encodeURIComponent(p.category)} className='underline'>{p.category}</Link> / {p.name}</p>

      <div className='grid gap-6 md:grid-cols-2 md:gap-10'>
        <div>
          <div className='relative grid aspect-square place-items-center overflow-hidden border border-neutral-200 bg-soft text-neutral-400'>
            {imgs.length ? (/* eslint-disable-next-line @next/next/no-img-element */ <img src={imgs[Math.min(img, imgs.length - 1)]} alt={p.name} className='h-full w-full object-contain' />) : <BoxIcon className='h-1/3 w-1/3' />}
            {p.discount > 0 && <span className='absolute left-3 top-3 rounded-sm bg-ink px-2 py-1 text-xs font-bold text-paper'>-{p.discount}%</span>}
          </div>
          {imgs.length > 1 && (
            <div className='mt-2 flex gap-2 overflow-x-auto'>
              {imgs.map((u, i) => (
                <button key={u} onClick={() => setImg(i)} aria-label={'Image ' + (i + 1)} aria-current={img === i} className={'h-16 w-16 flex-none overflow-hidden bg-soft ' + (img === i ? 'border-2 border-ink' : 'border border-neutral-200')}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={u} alt='' loading='lazy' className='h-full w-full object-contain' />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className='md:sticky md:top-32 md:self-start'>
          <p className='text-xs font-semibold uppercase tracking-widest text-neutral-500'>{p.category}</p>
          <h1 className='mb-2 text-2xl font-extrabold leading-tight md:text-3xl'>{p.name}</h1>
          <p className='text-sm text-graphite'>{summary ? <><span aria-label={summary.avg + ' sur 5'} className='text-gold-deep'>{'★'.repeat(Math.round(summary.avg))}{'☆'.repeat(5 - Math.round(summary.avg))}</span> {summary.avg} · {summary.count} avis{summary.sample ? ' d’exemple' : ''}</> : 'Aucun avis pour le moment'}</p>
          <p className='mt-3 text-3xl font-extrabold'>{formatMoney(p.price, currency)}{p.compareAt > 0 && <s className='ml-2 text-base font-normal text-neutral-500'>{formatMoney(p.compareAt, currency)}</s>}</p>
          {p.compareAt > 0 && <p className='text-sm font-semibold'>Vous économisez {formatMoney(p.compareAt - p.price, currency)} ({p.discount} %)</p>}

          {parsed.points.length > 0 && (
            <ul className='mt-3 space-y-1.5 text-sm'>
              {parsed.points.slice(0, 3).map((x, i) => (<li key={i} className='flex gap-2'><span aria-hidden className='font-bold'>✓</span><span>{x.title.length > 80 ? x.title.slice(0, 77) + '…' : x.title}</span></li>))}
            </ul>
          )}

          {real && Object.entries(groups).map(([k, values]) => (
            <div key={k} className='mt-4'>
              <b className='mb-1.5 block text-sm'>{k} : {sel[k]}</b>
              {values.map((val) => (<button key={val} onClick={() => pick(k, val)} aria-pressed={val === sel[k]} className={chip(val === sel[k])}>{val}</button>))}
            </div>
          ))}
          {!real && (<>
            <div className='mt-4'><b className='mb-1.5 block text-sm'>Couleur : {color}</b>{VARIANTS.Couleur.map((c) => (<button key={c} onClick={() => setColor(c)} aria-pressed={c === color} className={chip(c === color)}>{c}</button>))}</div>
            <div className='mt-2'><b className='mb-1.5 block text-sm'>Taille : {size}</b>{VARIANTS.Taille.map((s) => (<button key={s} onClick={() => setSize(s)} aria-pressed={s === size} className={chip(s === size)}>{s}</button>))}</div>
          </>)}

          {reviews}

          {low ? (
            <div className='mt-3 text-sm'>
              <p className='flex items-center gap-2 font-semibold text-red-700'><span className='h-2.5 w-2.5 rounded-full bg-red-600' />Plus que {p.stock} en stock — commandez vite</p>
              <div className='mt-1.5 h-1.5 w-full max-w-xs rounded-full bg-neutral-200'><div className='h-full rounded-full bg-red-600' style={{ width: Math.max(8, Math.min(100, (p.stock / LOW_STOCK) * 100)) + '%' }} /></div>
              {demoStock && <p className='mt-1 text-[11px] text-neutral-500'>Niveau de stock d’exemple — démonstration</p>}
            </div>
          ) : (
            <p className='mt-3 flex items-center gap-2 text-sm'><span className={'h-2.5 w-2.5 rounded-full ' + (out ? 'bg-neutral-400' : 'bg-ink')} />{out ? 'Rupture de stock' : 'En stock, prêt à expédier'}</p>
          )}

          <div className='mt-4 flex flex-wrap items-center gap-3'>
            <span className='inline-flex rounded border border-ink'>
              <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label='Moins' className='h-12 w-11 text-lg'>−</button>
              <span className='grid w-10 place-items-center'>{Math.min(qty, maxQty)}</span>
              <button onClick={() => setQty(Math.min(maxQty, qty + 1))} aria-label='Plus' className='h-12 w-11 text-lg'>+</button>
            </span>
            <button disabled={out} onClick={buy} className='h-12 min-w-40 flex-1 rounded bg-ink font-bold text-paper hover:bg-graphite disabled:bg-neutral-300'>Ajouter au panier · {formatMoney(p.price * qty, currency)}</button>
          </div>
          <button disabled={out} onClick={() => { buy(); router.push('/checkout'); }} className='mt-2.5 h-12 w-full rounded border-2 border-ink font-bold disabled:opacity-40'>Acheter maintenant</button>

          <ul className='mt-5 grid grid-cols-2 gap-2'>
            {PERKS.map((x) => (<li key={x.t} className='rounded border border-neutral-200 p-2.5 text-xs'><b className='block text-[13px]'>{x.t}</b>{x.d}</li>))}
          </ul>
          <p className='mt-3 text-xs text-neutral-600'>Livraison estimée : États-Unis 7 à 14 jours · Haïti 14 à 25 jours (provisoire).</p>
        </div>
      </div>

      {beforeAfter && (
        <section className='mt-10 rounded-lg bg-soft p-4 md:p-8'>
          <div className='grid gap-6 md:grid-cols-2 md:items-center md:gap-10'>
            <BeforeAfter before={beforeAfter.before} after={beforeAfter.after} alt={p.name} />
            <div>
              <h2 className='text-2xl font-extrabold md:text-3xl'>Avant / Après</h2>
              <p className='mt-1 text-sm text-graphite'>Faites glisser le curseur pour comparer.</p>
              {parsed.points.length > 0 && (
                <ul className='mt-4 space-y-2'>
                  {parsed.points.slice(0, 3).map((x, i) => (<li key={i} className='flex gap-2 font-medium'><span aria-hidden className='font-bold'>✓</span><span>{x.title.length > 90 ? x.title.slice(0, 87) + '…' : x.title}</span></li>))}
                </ul>
              )}
              <p className='mt-4 text-xs text-neutral-600'>Photos fournies à titre d’illustration. Les résultats varient d’une personne à l’autre.</p>
              <button disabled={out} onClick={buy} className='mt-4 h-12 rounded bg-ink px-8 font-bold text-paper hover:bg-graphite disabled:bg-neutral-300'>Ajouter au panier</button>
            </div>
          </div>
        </section>
      )}

      {bundle.length > 1 && (
        <section className='mt-10 rounded border border-ink p-4'>
          <h2 className='mb-1 text-xl font-bold'>{hasUpsell ? 'Complétez votre achat' : 'Souvent achetés ensemble'}</h2>
          {hasUpsell && <p className='mb-3 text-sm text-graphite'>Des articles qui vont bien avec ce produit.</p>}
          <div className={'flex gap-2 overflow-x-auto pb-2 ' + (hasUpsell ? '' : 'mt-2')}>
            {bundle.map((b, k) => (
              <label key={b.id} className='flex w-36 flex-none cursor-pointer flex-col gap-1 text-xs'>
                <span className='relative grid aspect-square place-items-center overflow-hidden bg-soft text-neutral-400'><Thumb p={b} /><input type='checkbox' className='absolute left-2 top-2 h-5 w-5 accent-black' checked={picked.includes(b.id)} disabled={k === 0} onChange={(e) => setPicked(e.target.checked ? [...picked, b.id] : picked.filter((x) => x !== b.id))} aria-label={b.name} /></span>
                <span className='line-clamp-2'>{k === 0 ? 'Cet article : ' : ''}{b.name}</span>
                <b>{formatMoney(b.price, currency)}</b>
                {k > 0 && <Link href={'/products/' + b.id} className='underline'>Voir le produit</Link>}
              </label>
            ))}
          </div>
          <div className='mt-3 flex flex-wrap items-center justify-between gap-3'>
            <p className='text-sm'>Total pour {picked.length} article{picked.length > 1 ? 's' : ''} : <b className='text-lg'>{formatMoney(bundleTotal, currency)}</b></p>
            <button onClick={() => bundle.filter((b) => picked.includes(b.id)).forEach((b) => add(b.id, 1, bundleVariant(b)))} className='rounded bg-ink px-5 py-3 font-bold text-paper hover:bg-graphite'>Ajouter la sélection au panier</button>
          </div>
        </section>
      )}

      <section className='mt-10 grid gap-6 md:grid-cols-2'>
        <div>
          <h2 className='mb-2 text-xl font-bold'>Pourquoi commander chez AMIRCAL</h2>
          <ul className='space-y-2 text-sm'>
            {['Commandez en USD ou en HTG', 'Suivi de colis disponible dans votre compte', 'Paiement sécurisé par un prestataire externe', 'Livraison vers les États-Unis et Haïti'].map((t) => (<li key={t} className='flex gap-2'><span aria-hidden>✓</span>{t}</li>))}
          </ul>
        </div>
        <div className='rounded border border-neutral-200 p-4 text-sm leading-relaxed'>
          <b>Description</b>
          {paras.length ? paras.map((t, i) => (<p key={i} className='mt-2'>{t}</p>)) : parsed.points.length ? null : <p className='mt-1'>La description détaillée de ce produit sera ajoutée prochainement.</p>}
          {!paras.length && parsed.points.length > 0 && <p className='mt-1'>Voir les détails du produit ci-dessous.</p>}
        </div>
      </section>

      {(detailCards.length > 0 || parsed.how || parsed.ingredients) && (
        <section className='mt-10'>
          <h2 className='mb-3 text-xl font-bold'>Détails du produit</h2>
          {detailCards.length > 0 && (
            <div className='grid gap-3 sm:grid-cols-2'>
              {detailCards.map((x, i) => (<div key={i} className='rounded border border-neutral-200 p-3 text-sm'><b className='block'>{x.title}</b><p className='mt-1 text-graphite'>{x.text}</p></div>))}
            </div>
          )}
          {parsed.how && (
            <details className='group mt-3 border-y border-neutral-200 py-3'><summary className='flex cursor-pointer list-none items-center justify-between font-medium'>Comment l’utiliser<span className='text-xl group-open:rotate-45'>+</span></summary><p className='mt-2 text-sm text-graphite'>{parsed.how}</p></details>
          )}
          {parsed.ingredients && (
            <details className='group border-b border-neutral-200 py-3'><summary className='flex cursor-pointer list-none items-center justify-between font-medium'>Ingrédients<span className='text-xl group-open:rotate-45'>+</span></summary><p className='mt-2 text-sm text-graphite'>{parsed.ingredients}</p></details>
          )}
        </section>
      )}

      <section className='mt-10'>
        <h2 className='mb-3 text-xl font-bold'>Questions fréquentes</h2>
        <div className='divide-y divide-neutral-200 border-y border-neutral-200'>
          {FAQ.map(([q, a]) => (<details key={q} className='group py-3'><summary className='flex cursor-pointer list-none items-center justify-between font-medium'>{q}<span className='text-xl group-open:rotate-45'>+</span></summary><p className='mt-2 text-sm text-graphite'>{a}</p></details>))}
        </div>
      </section>

      {!reviews && (
        <section className='mt-10'>
          <h2 className='mb-3 text-xl font-bold'>Avis clients</h2>
          <div className='border border-dashed border-neutral-400 p-8 text-center'>Soyez le premier à donner votre avis.</div>
        </section>
      )}

      {related.length > 0 && (
        <section className='mt-10'>
          <h2 className='mb-3 text-xl font-bold'>Vous aimerez aussi</h2>
          <div className='flex gap-2.5 overflow-x-auto pb-2'>{related.map((r) => (<div key={r.id} className='w-40 flex-none'><ProductCard p={r} /></div>))}</div>
        </section>
      )}

      {seen.length > 0 && (
        <section className='mt-10'>
          <h2 className='mb-3 text-xl font-bold'>Consultés récemment</h2>
          <div className='flex gap-2.5 overflow-x-auto pb-2'>{seen.map((r) => (<div key={r.id} className='w-40 flex-none'><ProductCard p={r} /></div>))}</div>
        </section>
      )}

      <div className='fixed inset-x-0 bottom-14 z-30 flex items-center gap-3 border-t border-ink bg-paper px-4 py-2 md:hidden'>
        <div className='min-w-0 flex-1'><p className='truncate text-xs'>{p.name}</p><b>{formatMoney(p.price * qty, currency)}</b>{p.compareAt > 0 && <s className='ml-1.5 text-xs text-neutral-500'>{formatMoney(p.compareAt * qty, currency)}</s>}</div>
        <button disabled={out} onClick={buy} className='h-11 rounded bg-ink px-5 font-bold text-paper disabled:bg-neutral-300'>{out ? 'Indisponible' : 'Ajouter'}</button>
      </div>
    </main>
  );
}
