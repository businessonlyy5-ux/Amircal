// Catégorie du site -> requêtes dans le catalogue Zendrop.
// cat = id de catégorie Zendrop, kw = mot-clé, include/exclude = filtres sur le titre.
// Toutes les requêtes sont limitées aux entrepôts US (ships_from: 'US').
// Les clés doivent être identiques aux noms de la table categories de Supabase (ex. « Maison », « Sports »).
// Cinq couples de catégories ont une seule clé d’import : Maison (puis Cuisine), Enfants (puis Bébé), Beauté (puis Soins),
// Sports (puis Plein air), Jouets (puis Jeux). Un déclencheur Supabase (assign_subcategory) place chaque produit importé
// dans la bonne catégorie du couple d’après son titre et les sous-catégories ; sans correspondance, il reste dans la catégorie d’import.
const MEN = { include: /\bmen(’|')?s?\b/i, exclude: /\bwom[ae]n|\bgirls?\b|\bladies\b/i };
const WOMEN = { include: /\bwom[ae]n|\bladies\b|\bgirls?\b/i };

// Requêtes par mot-clé seul (sans catégorie Zendrop) : elles ajoutent des produits US quand une
// catégorie Zendrop en compte peu. Le filtre sur le titre évite les produits hors sujet.
const byKeywords = (words, include) => words.map((kw) => ({ kw, include }));
const AUTO = /\b(car|cars|auto|automotive|vehicle|truck|suv|motorcycle|tires?|dashboard|steering|windshield|trunk|license plate)\b/i;
const SPORT = /\b(fitness|yoga|gym|workout|exercise|camping|hiking|fishing|golf|cycling|bike|running|tent|resistance|dumbbell|kayak|sports?)\b/i;
const TOYS = /\b(toys?|puzzles?|games?|plush|dolls?|blocks?|building|playset|stuffed|action figures?)\b/i;
const TRAVEL = /\b(travel|luggage|suitcase|backpack|duffel|passport|carry-on|packing|neck pillow|trip)\b/i;
const DIY = /\b(tools?|drill|screwdriver|wrench|hammer|pliers?|saw|toolbox|tape measure|socket|sander|bits?)\b/i;

export const NICHES = {
  'Électronique': [{ cat: 106 }, { cat: 6 }],
  'Maison': [{ cat: 11 }, { cat: 171 }, { cat: 180 }, { cat: 14 }],
  'Mode homme': [
    { cat: 16, kw: "men's", ...MEN },
    { cat: 23, kw: "men's", ...MEN },
    { cat: 25, kw: "men's", ...MEN },
    { cat: 13, kw: "men's", ...MEN },
    ...byKeywords(["men's shirt", "men's shoes", "men's watch", "men's wallet", "men's jacket"], MEN.include).map((q) => ({ ...q, exclude: MEN.exclude })),
  ],
  'Mode femme': [
    { cat: 16, kw: "women's", ...WOMEN },
    { cat: 23, kw: "women's", ...WOMEN },
    { cat: 25, kw: "women's", ...WOMEN },
    { cat: 13, kw: "women's", ...WOMEN },
    { cat: 15, kw: "women's", ...WOMEN },
    ...byKeywords(["women's dress", "women's shoes", "women's bag", "women's necklace", "women's top"], WOMEN.include),
  ],
  'Enfants': [
    { cat: 67 },
    { cat: 61, kw: 'kids' },
    { cat: 187, kw: 'kids' },
    ...byKeywords(['baby', 'toddler', 'kids', 'infant'], /\b(baby|babies|toddlers?|kids?|infants?|children|child)\b/i),
  ],
  'Beauté': [{ cat: 165 }, { cat: 4 }],
  'Auto': [{ cat: 260 }, ...byKeywords(['car', 'truck', 'motorcycle', 'auto', 'vehicle'], AUTO)],
  'Sports': [
    { cat: 252 }, { cat: 5 }, { cat: 24 },
    ...byKeywords(['fitness', 'yoga', 'gym', 'camping', 'hiking', 'fishing', 'golf', 'bike', 'running', 'workout'], SPORT),
  ],
  'Jouets': [
    { cat: 255 },
    ...byKeywords(['toy', 'puzzle', 'game', 'plush', 'doll', 'building blocks', 'board game'], TOYS),
  ],
  'Animaux': [
    { cat: 60 },
    { kw: 'dog', include: /\b(dogs?|pupp(y|ies))\b/i },
    { kw: 'cat', include: /\b(cats?|kittens?)\b/i },
    { kw: 'pet', include: /\bpets?\b/i },
  ],
  'Voyage': [
    { cat: 187, kw: 'travel' }, { cat: 193 }, { cat: 199 }, { cat: 196 },
    ...byKeywords(['travel', 'luggage', 'suitcase', 'backpack', 'duffel', 'passport'], TRAVEL),
  ],
  'Bureau': [{ cat: 213 }, { cat: 136 }],
  'Bricolage': [
    { cat: 150 }, { cat: 164 }, { cat: 163 },
    ...byKeywords(['tool', 'drill', 'screwdriver', 'wrench', 'hammer', 'pliers', 'toolbox', 'socket'], DIY),
  ],
};
