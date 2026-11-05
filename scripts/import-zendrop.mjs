// Import du catalogue Zendrop (entrepôts US) -> Supabase + lib/catalog.json, puis synchronisation des variantes.
//
// Variables d'environnement :
//   ZENDROP_API_KEY            (obligatoire) jeton d'accès Zendrop, envoyé en « Bearer » au serveur MCP
//   SUPABASE_SERVICE_ROLE_KEY  (obligatoire sauf DRY_RUN)
//   NEXT_PUBLIC_SUPABASE_URL   (optionnel, valeur par défaut = projet Amircal)
//   MAX_PER_CATEGORY           (défaut 200) nouveaux produits maximum par catégorie du site
//   DRY_RUN=1                  compte seulement les produits disponibles, n'écrit rien
//
// Le job GitHub s'arrête à 60 min. Le script se limite donc lui-même :
//   - collecte des produits : 38 min au maximum, répartis équitablement entre les catégories ;
//   - variantes Zendrop (couleurs, tailles, identifiants de commande) : jusqu'à la 54e minute.
// Ce qui n'a pas eu le temps d'être fait est simplement repris au lancement suivant
// (les produits déjà en base sont ignorés, seuls les produits sans variante réelle sont traités).
//
// Le nettoyage des fiches (HTML, CSS parasite, entités, longueur) est fait ici.
// Prix : base_price_usd = cost_usd = prix Zendrop ; la marge est appliquée par le site (lib/data.ts).
// Relançable sans risque : les produits déjà présents dans Supabase sont ignorés, et un produit refusé
// par la base est signalé puis sauté (il ne bloque plus tout l'import).
import { readFile, writeFile, appendFile } from 'node:fs/promises';
import { NICHES } from './niches.mjs';

const ENDPOINT = process.env.ZENDROP_MCP_URL || 'https://app.zendrop.com/mcp/v1';
const TOKEN = process.env.ZENDROP_API_KEY;
const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uzzuxqhoouyfhpqjtpht.supabase.co';
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const MAX = Number(process.env.MAX_PER_CATEGORY || 200);
const DRY = ['1', 'true'].includes(String(process.env.DRY_RUN || '').toLowerCase());
const PAGE = 60;
const MAX_PAGES = 20; // pages lues au maximum par requête
const MAX_COST = 300; // on ignore les produits plus chers (USD)
const STOCK_PLACEHOLDER = 25; // même valeur que le catalogue actuel (stock réel : à synchroniser plus tard)
const T0 = Date.now();
const PRODUCTS_DEADLINE = T0 + 38 * 60 * 1000;
const VARIANTS_DEADLINE = T0 + 54 * 60 * 1000;
const CONCURRENCY = 6; // appels Zendrop en parallèle pour les variantes
const BLOCK = /\b(cbd|thc|hemp|kratom|vapes?|vaping|tobacco|cigar(s|ettes?)?|firearms?|guns?|ammo|ammunition|weapons?|erotic|sex|lingerie|pepper spray|taser)\b/i;

if (!TOKEN) throw new Error('ZENDROP_API_KEY manquant');
if (!DRY && !SB_KEY) throw new Error('SUPABASE_SERVICE_ROLE_KEY manquant (ou lancez avec DRY_RUN=1)');

// ---------- Client MCP Zendrop (JSON-RPC sur HTTP) ----------
let sessionId = null;
let rpcId = 1;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function rpc(method, params, notify = false) {
  const body = notify ? { jsonrpc: '2.0', method, params } : { jsonrpc: '2.0', id: rpcId++, method, params };
  for (let attempt = 1; attempt <= 4; attempt++) {
    const headers = { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream', Authorization: `Bearer ${TOKEN}` };
    if (sessionId) headers['Mcp-Session-Id'] = sessionId;
    const res = await fetch(ENDPOINT, { method: 'POST', headers, body: JSON.stringify(body) });
    const sid = res.headers.get('mcp-session-id');
    if (sid) sessionId = sid;
    if (res.status === 429 || res.status >= 500) { await sleep(1500 * attempt); continue; }
    const text = await res.text();
    if (!res.ok) throw new Error(`Zendrop MCP ${res.status}: ${text.slice(0, 200)}`);
    if (notify) return null;
    let msg;
    if ((res.headers.get('content-type') || '').includes('text/event-stream')) {
      msg = text.split('\n').filter((l) => l.startsWith('data:')).map((l) => l.slice(5).trim()).filter(Boolean).map((d) => JSON.parse(d)).find((m) => m.id === body.id);
    } else msg = JSON.parse(text);
    if (!msg) throw new Error('Réponse MCP vide');
    if (msg.error) throw new Error(`Zendrop MCP : ${msg.error.message}`);
    return msg.result;
  }
  throw new Error('Zendrop MCP indisponible après plusieurs essais');
}

async function initMcp() {
  await rpc('initialize', { protocolVersion: '2025-03-26', capabilities: {}, clientInfo: { name: 'amircal-import', version: '1.0' } });
  await rpc('notifications/initialized', {}, true);
}

async function callTool(name, args) {
  const r = await rpc('tools/call', { name, arguments: args });
  const text = (r.content || []).find((c) => c.type === 'text')?.text || '';
  if (r.isError) throw new Error(text.slice(0, 200));
  try { return JSON.parse(text); } catch { return JSON.parse(text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1)); }
}

// ---------- Nettoyage ----------
const ENT = { '&amp;': '&', '&nbsp;': ' ', '&quot;': '"', '&#39;': "'", '&lt;': '<', '&gt;': '>', '&rsquo;': '’', '&lsquo;': '’' };
const decode = (s) => s.replace(/&(amp|nbsp|quot|lt|gt|rsquo|lsquo|#39);/g, (m) => ENT[m]).replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n));

export function cleanText(html = '') {
  let s = String(html).replace(/<(style|script)[\s\S]*?<\/\1>/gi, ' ').replace(/<!--[\s\S]*?-->/g, ' ');
  s = s.replace(/<br\s*\/?>|<\/(p|div|li|h\d|tr)>/gi, '\n').replace(/<[^>]+>/g, ' ');
  s = decode(s);
  if (/litepicker|\{[^}]*:[^}]*;[^}]*\}/.test(s)) { // CSS laissé en texte brut par certains fournisseurs
    let prev;
    do { prev = s; s = s.replace(/[^{}]*\{[^{}]*\}/g, ' '); } while (s !== prev);
  }
  s = s.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\ud800-\udfff]/g, ''); // caractères que Postgres refuse
  return s.replace(/[ \t\u00a0]+/g, ' ').replace(/\s*\n\s*/g, '\n').replace(/\n{2,}/g, '\n').trim();
}
function cut(s, n) {
  if (s.length <= n) return s;
  const part = s.slice(0, n);
  const i = Math.max(part.lastIndexOf('. '), part.lastIndexOf('\n'));
  return (i > n * 0.5 ? part.slice(0, i + 1) : part.slice(0, part.lastIndexOf(' '))).trim();
}
const cleanTitle = (t) => cut(cleanText(t).replace(/\s+/g, ' ').replace(/[\s,;:-]+$/, ''), 110);
function cleanDescription(d, title) {
  const t = cut(cleanText(d), 1200);
  return t.length >= 40 ? t : title;
}
const slugify = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
const titleKey = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 60);

// ---------- Collecte ----------
const seenIds = new Set();
const seenTitles = new Set();

function accept(p, q) {
  const cost = Number(p.price);
  const image = p.image || p.images?.[0]?.url;
  const name = cleanTitle(p.name || '');
  if (!p.id || !name || !image || !(cost > 0) || cost > MAX_COST) return null;
  if (p.availability?.in_stock === false) return null;
  if (p.supplier?.country && p.supplier.country !== 'US') return null;
  if (BLOCK.test(name)) return null;
  if (q.include && !q.include.test(name)) return null;
  if (q.exclude && q.exclude.test(name)) return null;
  const key = titleKey(name);
  if (seenIds.has(p.id) || seenTitles.has(key)) return null;
  seenIds.add(p.id); seenTitles.add(key);
  return { id: p.id, name, cost, image, images: (p.images || []).map((i) => i.url).filter(Boolean).slice(0, 5), description: cleanDescription(p.description, name) };
}

async function collect(site, queries, skipIds, deadline = Infinity) {
  const states = queries.map((q) => ({ q, page: 1, done: false, found: 0 }));
  const out = [];
  while (out.length < MAX && Date.now() < deadline && states.some((s) => !s.done)) {
    for (const s of states) {
      if (s.done || out.length >= MAX || Date.now() >= deadline) continue;
      const args = { limit: PAGE, page: s.page, ships_from: 'US' };
      if (s.q.cat) args.category_id = s.q.cat;
      if (s.q.kw) args.keyword = s.q.kw;
      let data;
      try { data = await callTool('get_catalog_products', args); } catch (e) { console.warn(`  ! ${site} ${JSON.stringify({ cat: s.q.cat, kw: s.q.kw })} : ${e.message}`); s.done = true; continue; }
      const list = data.products || [];
      for (const p of list) {
        if (skipIds.has(p.id)) continue;
        const item = accept(p, s.q);
        if (item) { out.push(item); s.found++; if (out.length >= MAX) break; }
      }
      if (!list.length || s.page * PAGE >= (data.total || 0) || s.page >= MAX_PAGES) s.done = true; else s.page++;
    }
  }
  return out;
}

// ---------- Supabase (API REST) ----------
async function sb(path, opts = {}) {
  const res = await fetch(`${SB_URL}/rest/v1/${path}`, { ...opts, headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': 'application/json', ...(opts.headers || {}) } });
  if (!res.ok) throw new Error(`Supabase ${res.status} : ${(await res.text()).slice(0, 300)}`);
  if (res.status === 204) return null;
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}
async function sbAll(path) {
  const rows = [];
  for (let off = 0; ; off += 1000) {
    const part = await sb(`${path}&limit=1000&offset=${off}`);
    rows.push(...part);
    if (part.length < 1000) return rows;
  }
}
async function existingSupplierIds() {
  const ids = new Set();
  for (let off = 0; ; off += 1000) {
    const rows = await sb(`products?select=supplier_product_id&supplier=eq.zendrop&order=id&limit=1000&offset=${off}`);
    rows.forEach((r) => r.supplier_product_id && ids.add(String(r.supplier_product_id)));
    if (rows.length < 1000) return ids;
  }
}
// Les doublons (même fournisseur + même id produit) sont ignorés par la base ; seuls les produits réellement ajoutés sont renvoyés.
const insertProducts = (rows) => sb('products?on_conflict=supplier,supplier_product_id', { method: 'POST', headers: { Prefer: 'resolution=ignore-duplicates,return=representation' }, body: JSON.stringify(rows) });

async function saveToSupabase(site, items, categoryId, already) {
  const fresh = items.filter((i) => !already.has(String(i.id)));
  let saved = 0;
  for (let i = 0; i < fresh.length; i += 100) {
    const chunk = fresh.slice(i, i + 100);
    const rows = chunk.map((p) => ({ category_id: categoryId, slug: `${slugify(p.name)}-${p.id}`, title: p.name, description: p.description, supplier: 'zendrop', supplier_product_id: String(p.id), base_price_usd: p.cost, cost_usd: p.cost, is_active: true, review_count: 0 }));
    let inserted;
    try { inserted = await insertProducts(rows); } catch (e) {
      console.warn(`  ! ${site} : lot refusé (${e.message}) -> essai produit par produit`);
      inserted = [];
      for (const r of rows) {
        try { inserted.push(...(await insertProducts([r]))); } catch (e2) { console.warn(`    produit ignoré ${r.supplier_product_id} (${r.title.slice(0, 40)}) : ${e2.message}`); }
      }
    }
    const byId = new Map(inserted.map((r) => [r.supplier_product_id, r.id]));
    const imgs = chunk.flatMap((p) => p.images.map((url, n) => ({ product_id: byId.get(String(p.id)), url, sort_order: n }))).filter((r) => r.product_id);
    if (imgs.length) { try { await sb('product_images', { method: 'POST', body: JSON.stringify(imgs) }); } catch (e) { console.warn(`  ! ${site} : images non enregistrées (${e.message})`); } }
    saved += inserted.length;
  }
  return saved;
}

// ---------- Variantes Zendrop ----------
// Pour chaque produit Zendrop sans variante réelle : on lit sa fiche, on enregistre toutes ses variantes
// (identifiant Zendrop, SKU, couleur / taille, prix coûtant), puis on supprime la variante provisoire éventuelle.
const emptyLabel = (s) => !s || /^default( title)?$/i.test(s);
function variantOptions(v) {
  const o = {};
  const color = String(v.color ?? '').trim();
  const size = String(v.size ?? '').trim();
  if (!emptyLabel(color)) o['Couleur'] = color;
  if (!emptyLabel(size)) o['Taille'] = size;
  return o;
}

async function syncVariants() {
  const prods = await sbAll('products?select=id,supplier_product_id&supplier=eq.zendrop&is_active=eq.true&order=id');
  const real = new Set((await sbAll('product_variants?select=product_id&supplier_variant_id=not.is.null&order=id')).map((r) => r.product_id));
  const todo = prods.filter((p) => p.supplier_product_id && !real.has(p.id));
  console.log(`Variantes : ${todo.length} produits à traiter sur ${prods.length}.`);
  let next = 0, ok = 0, empty = 0, failed = 0;
  const worker = async () => {
    while (next < todo.length && Date.now() < VARIANTS_DEADLINE) {
      const p = todo[next++];
      try {
        const d = await callTool('get_catalog_product', { product_id: Number(p.supplier_product_id) });
        const vs = (d.variants || []).filter((v) => v.variant_id && Number(v.price) > 0).slice(0, 40);
        if (!vs.length) { empty++; continue; }
        const rows = vs.map((v) => ({ product_id: p.id, supplier_variant_id: String(v.variant_id), sku: v.sku || null, options: variantOptions(v), price_usd: Number(v.price), cost_usd: Number(v.price), stock: STOCK_PLACEHOLDER, is_active: true }));
        await sb('product_variants', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(rows) });
        await sb(`product_variants?product_id=eq.${p.id}&supplier_variant_id=is.null`, { method: 'DELETE' });
        ok++;
      } catch (e) {
        failed++;
        if (failed <= 10) console.warn(`  ! variantes ${p.supplier_product_id} : ${e.message}`);
      }
    }
  };
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  const left = Math.max(0, todo.length - next);
  console.log(`Variantes : ${ok} produits mis à jour, ${empty} sans variante exploitable, ${failed} erreurs, ${left} restants (relancer l'import pour les traiter).`);
  if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, `\nVariantes : **${ok}** produits mis à jour, ${empty} sans variante, ${failed} erreurs, **${left}** restants (relancer pour continuer).\n`);
}

// ---------- Programme principal ----------
await initMcp();
const catalogPath = new URL('../lib/catalog.json', import.meta.url);
const existing = JSON.parse(await readFile(catalogPath, 'utf8'));
existing.forEach((p) => { seenIds.add(p.id); seenTitles.add(titleKey(p.name)); });
const skipIds = new Set(existing.map((p) => p.id));

let categoryIds = {};
let already = new Set();
if (!DRY) {
  (await sb('categories?select=id,name')).forEach((c) => { categoryIds[c.name] = c.id; });
  already = await existingSupplierIds();
}

const summary = [];
const added = [];
const cats = Object.entries(NICHES);
for (let k = 0; k < cats.length; k++) {
  const [site, queries] = cats[k];
  // Chaque catégorie reçoit une part égale du temps restant (sauf en test à blanc, sans limite de temps).
  const slice = (PRODUCTS_DEADLINE - Date.now()) / (cats.length - k);
  const deadline = DRY ? Infinity : slice > 5000 ? Date.now() + slice : 0;
  const items = deadline === 0 ? [] : await collect(site, queries, skipIds, deadline);
  const have = existing.filter((p) => p.category === site).length;
  let saved = 0;
  if (!DRY && items.length) {
    if (!categoryIds[site]) throw new Error(`Catégorie introuvable dans Supabase : ${site}`);
    try { saved = await saveToSupabase(site, items, categoryIds[site], already); } catch (e) { console.warn(`  ! ${site} : enregistrement Supabase interrompu : ${e.message}`); }
  }
  items.forEach((p) => added.push({ id: p.id, name: p.name, category: site, cost: p.cost, stock: STOCK_PLACEHOLDER, image: p.image }));
  summary.push({ categorie: site, deja_au_catalogue: have, nouveaux_US: items.length, total: have + items.length, objectif_100: have + items.length >= 100 ? 'OK' : 'INSUFFISANT', ajoutes_supabase: saved });
  console.log(`${site} : +${items.length} (total ${have + items.length}), ajoutés en base : ${saved}`);
}

console.table(summary);
if (process.env.GITHUB_STEP_SUMMARY) {
  const md = ['| Catégorie | Déjà | Nouveaux (US) | Total | ≥ 100 | En base |', '|---|---|---|---|---|---|', ...summary.map((s) => `| ${s.categorie} | ${s.deja_au_catalogue} | ${s.nouveaux_US} | ${s.total} | ${s.objectif_100} | ${s.ajoutes_supabase} |`)].join('\n');
  await appendFile(process.env.GITHUB_STEP_SUMMARY, md + '\n');
}

if (DRY) { console.log('DRY_RUN : aucune écriture.'); process.exit(0); }
const all = [...existing, ...added];
await writeFile(catalogPath, '[\n' + all.map((p) => '  ' + JSON.stringify(p)).join(',\n') + '\n]\n');
console.log(`lib/catalog.json : ${all.length} produits.`);

// Les variantes passent en dernier : si cette étape échoue, le catalogue est déjà enregistré.
try { await syncVariants(); } catch (e) { console.warn(`  ! synchronisation des variantes interrompue : ${e.message}`); }
