// Met en forme les descriptions fournisseur (souvent un bloc de texte avec des étiquettes) :
// points forts, paragraphes lisibles, mode d’emploi et ingrédients. Aucune information n’est inventée : tout vient du texte du fournisseur.
export type Point = { title: string; text: string };
export type Parsed = { points: Point[]; paragraphs: string[]; how?: string; ingredients?: string };

const BRACKET = /\[([^\[\]]{3,90})\]/g;
const CAPS = /(?:^|\s)([A-Z][A-Z0-9&'’\/-]*(?:\s+[A-Z0-9&'’\/-]+){1,7}):\s+/g;
const STOP = /\b(?:Ingredients?|How to use|Directions?|Instructions?|Usage|Features?|Specifications?|Package(?: includes| contents)?|Warnings?|Note)\s*[:\-]|\[[^\[\]]{3,90}\]/i;
const HOW_RE = /\b(?:How to use|Directions?(?: for use)?|Usage|Instructions?)\s*[:\-]\s*/i;
const ING_RE = /\bIngredients?\s*[:\-]\s*/i;

const sentences = (t: string) => (t.match(/[^.!?]+[.!?]+(?=\s|$)/g) ?? [t]).map((x) => x.trim()).filter(Boolean);

function cut(s: string, n: number) {
  if (s.length <= n) return s;
  const part = s.slice(0, n);
  const i = part.lastIndexOf('. ');
  if (i > n * 0.5) return part.slice(0, i + 1);
  return part.slice(0, part.lastIndexOf(' ') > 0 ? part.lastIndexOf(' ') : n).trim() + '…';
}

function tidy(t: string) {
  let s = t.replace(/\s+/g, ' ').replace(/^[\s\-–—:;,."']+|[\s"']+$/g, '');
  if (s && s === s.toUpperCase() && /[A-Z]/.test(s)) s = s.charAt(0) + s.slice(1).toLowerCase(); // ÉTIQUETTE EN MAJUSCULES -> phrase normale
  return s;
}

// Extrait une section (mode d’emploi, ingrédients) et la retire du texte principal.
function grab(s: string, re: RegExp): [string | undefined, string] {
  const m = re.exec(s);
  if (!m) return [undefined, s];
  const rest = s.slice(m.index + m[0].length);
  const e = rest.search(STOP);
  const txt = tidy(e >= 0 ? rest.slice(0, e) : rest);
  return [txt.length >= 15 ? cut(txt, 500) : undefined, s.slice(0, m.index) + ' ' + (e >= 0 ? rest.slice(e) : '')];
}

export function parseDescription(raw?: string | null, name = ''): Parsed {
  const out: Parsed = { points: [], paragraphs: [] };
  if (!raw) return out;
  let s = String(raw)
    .replace(/^\s*\[\s*"/, '').replace(/"\s*\]\s*$/, '') // tableau JSON laissé en texte par certains fournisseurs
    .replace(/\\"/g, '"').replace(/"\s*(?=\[)/g, ' ')
    .replace(/([a-z0-9)])\.([A-Z])/g, '$1. $2') // phrases collées : « fin.Début »
    .replace(/\s+/g, ' ').trim();
  if (!s || s === name) return out;

  [out.how, s] = grab(s, HOW_RE);
  [out.ingredients, s] = grab(s, ING_RE);
  s = s.replace(/\s+/g, ' ').trim();

  let intro = s;
  const br = [...s.matchAll(BRACKET)];
  const cp = br.length >= 2 ? [] : [...s.matchAll(CAPS)];
  const marks = br.length >= 2 ? br : cp.length >= 2 ? cp : [];
  if (marks.length >= 2) {
    intro = s.slice(0, marks[0].index ?? 0);
    out.points = marks
      .map((m, i) => {
        const from = (m.index ?? 0) + m[0].length;
        const to = marks[i + 1]?.index ?? s.length;
        return { title: tidy(m[1]), text: cut(tidy(s.slice(from, to)), 260) };
      })
      .filter((x) => x.title.length >= 3);
  } else {
    const f = /(?:^|\s)(?:Features?|Highlights?|Key features?)\s*:\s*/i.exec(s);
    const src = f ? s.slice(f.index + f[0].length) : s;
    out.points = sentences(src).filter((x) => x.length >= 25 && x.length <= 140).slice(0, 5).map((x) => ({ title: tidy(x), text: '' }));
    if (f) intro = s.slice(0, f.index);
  }

  const base = tidy(intro);
  const source = base.length >= 30 ? base : out.points.some((x) => x.text) ? '' : s;
  if (source) {
    const ss = sentences(source);
    for (let i = 0; i < ss.length && out.paragraphs.length < 3; i += 3) out.paragraphs.push(cut(ss.slice(i, i + 3).join(' '), 400));
  }
  out.points = out.points.slice(0, 8);
  return out;
}
