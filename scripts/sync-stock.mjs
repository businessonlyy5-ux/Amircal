// Synchronise la disponibilité (en stock / rupture) des produits avec le catalogue Zendrop.
//
// Variables d’environnement :
//   ZENDROP_API_KEY            (obligatoire) jeton d’accès Zendrop
//   SUPABASE_SERVICE_ROLE_KEY  (obligatoire)
//   NEXT_PUBLIC_SUPABASE_URL   (facultatif, valeur par défaut = projet Amircal)
//   BATCH                      (défaut 3000) nombre de produits vérifiés par exécution
//   CONCURRENCY                (défaut 4) requêtes en parallèle
//
// Chaque exécution traite d’abord les produits jamais vérifiés, puis les plus anciennement vérifiés.
// Zendrop ne fournit pas de quantité : seulement « en stock » / « en rupture ». Un produit introuvable est marqué en rupture.
// Sécurité : si plus de 40 % d’un lot semblent en rupture, on suppose un problème d’API et on n’écrit pas les ruptures.
import { appendFile } from 'node:fs/promises';

const ENDPOINT = process.env.ZENDROP_MCP_URL || 'https://app.zendrop.com/mcp/v1';
const TOKEN = process.env.ZENDROP_API_KEY;
const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uzzuxqhoouyfhpqjtpht.supabase.co';
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BATCH = Number(process.env.BATCH || 3000);
const CONC = Number(process.env.CONCURRENCY || 4);
if (!TOKEN) throw new Error('ZENDROP_API_KEY manquant');
if (!SB_KEY) throw new Error('SUPABASE_SERVICE_ROLE_KEY manquant');

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

async function callTool(name, args) {
  const r = await rpc('tools/call', { name, arguments: args });
  const text = (r.content || []).find((c) => c.type === 'text')?.text || '';
  if (r.isError) throw new Error(text.slice(0, 200));
  try { return JSON.parse(text); } catch { return JSON.parse(text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1)); }
}

async function sb(path, opts = {}) {
  const res = await fetch(`${SB_URL}/rest/v1/${path}`, { ...opts, headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': 'application/json', ...(opts.headers || {}) } });
  if (!res.ok) throw new Error(`Supabase ${res.status} : ${(await res.text()).slice(0, 300)}`);
  return res.status === 204 ? null : res.json();
}

await rpc('initialize', { protocolVersion: '2025-03-26', capabilities: {}, clientInfo: { name: 'amircal-stock-sync', version: '1.0' } });
await rpc('notifications/initialized', {}, true);

const rows = await sb(`products?select=id,supplier_product_id&is_active=eq.true&supplier=eq.zendrop&order=stock_synced_at.asc.nullsfirst&limit=${BATCH}`);
console.log(`${rows.length} produits à vérifier`);

const yes = [];
const no = [];
let skipped = 0;
let next = 0;
async function worker() {
  while (next < rows.length) {
    const r = rows[next++];
    try {
      const d = await callTool('get_catalog_product', { product_id: Number(r.supplier_product_id), variants_limit: 1 });
      const a = d.availability?.in_stock;
      if (typeof a === 'boolean') (a ? yes : no).push(r.id); else skipped++;
    } catch (e) {
      if (/not found|404|does not exist/i.test(String(e.message))) no.push(r.id); else skipped++;
    }
    if (next % 200 === 0) console.log(`  ${next}/${rows.length}`);
  }
}
await Promise.all(Array.from({ length: CONC }, worker));

const checked = yes.length + no.length;
const suspicious = checked > 0 && no.length > checked * 0.4;
if (suspicious) console.warn(`! ${no.length} ruptures sur ${checked} : lot suspect, les ruptures ne sont pas écrites.`);

const now = new Date().toISOString();
async function mark(ids, inStock) {
  for (let i = 0; i < ids.length; i += 100) {
    const chunk = ids.slice(i, i + 100);
    await sb(`products?id=in.(${chunk.join(',')})`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ in_stock: inStock, stock_synced_at: now }) });
  }
}
await mark(yes, true);
if (!suspicious) await mark(no, false);

const line = `Disponibilité : ${yes.length} en stock, ${suspicious ? 0 : no.length} en rupture, ${skipped} non vérifiés (${rows.length} produits dans ce lot).`;
console.log(line);
if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, line + '\n');
