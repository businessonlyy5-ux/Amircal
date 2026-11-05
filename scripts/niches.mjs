// Catégorie du site -> requêtes dans le catalogue Zendrop.
// cat = id de catégorie Zendrop, kw = mot-clé, include/exclude = filtres sur le titre.
// Toutes les requêtes sont limitées aux entrepôts US (ships_from: 'US').
// Les noms de catégories doivent être identiques à CATEGORIES dans lib/data.ts.
const MEN = { include: /\bmen(’|')?s?\b/i, exclude: /\bwom[ae]n|\bgirls?\b|\bladies\b/i };
const WOMEN = { include: /\bwom[ae]n|\bladies\b|\bgirls?\b/i };

export const NICHES = {
  'Électronique': [{ cat: 106 }, { cat: 6 }],
  'Maison & Cuisine': [{ cat: 11 }, { cat: 171 }, { cat: 180 }, { cat: 14 }],
  'Mode homme': [
    { cat: 16, kw: "men's", ...MEN },
    { cat: 23, kw: "men's", ...MEN },
    { cat: 25, kw: "men's", ...MEN },
    { cat: 13, kw: "men's", ...MEN },
  ],
  'Mode femme': [
    { cat: 16, kw: "women's", ...WOMEN },
    { cat: 23, kw: "women's", ...WOMEN },
    { cat: 25, kw: "women's", ...WOMEN },
    { cat: 13, kw: "women's", ...WOMEN },
    { cat: 15, kw: "women's", ...WOMEN },
  ],
  'Enfants & Bébé': [{ cat: 67 }, { cat: 61, kw: 'kids' }, { cat: 187, kw: 'kids' }],
  'Beauté & Soins': [{ cat: 165 }, { cat: 4 }],
  'Auto': [{ cat: 260 }],
  'Sports & Plein air': [{ cat: 252 }, { cat: 5 }, { cat: 24 }],
  'Jouets & Jeux': [{ cat: 255 }],
  'Animaux': [
    { cat: 60 },
    { kw: 'dog', include: /\b(dogs?|pupp(y|ies))\b/i },
    { kw: 'cat', include: /\b(cats?|kittens?)\b/i },
    { kw: 'pet', include: /\bpets?\b/i },
  ],
  'Voyage': [{ cat: 187, kw: 'travel' }, { cat: 193 }, { cat: 199 }, { cat: 196 }],
  'Bureau': [{ cat: 213 }, { cat: 136 }],
  'Bricolage': [{ cat: 150 }, { cat: 164 }, { cat: 163 }],
};
