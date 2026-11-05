# Bannières du carrousel d’accueil

Déposez vos images dans ce dossier (GitHub : **Add file → Upload files**, puis *Commit changes*). Render redéploie tout seul.

| Fichier | Usage | Taille conseillée |
|---|---|---|
| `hero-1.jpg` | slide 1, ordinateur et tablette | 2400 × 800 px (ratio 3:1) |
| `hero-1-mobile.jpg` | slide 1, téléphone (facultatif) | 1080 × 720 px (ratio 3:2) |
| `hero-2.jpg`, `hero-2-mobile.jpg` … | slides 2 à 8 | idem |

- Formats acceptés : `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif`. Le `.webp` est le plus léger.
- Poids conseillé : moins de 300 Ko par image.
- Gardez le texte et le sujet principal au centre : l’image est recadrée selon l’écran.
- Si vous n’ajoutez pas de version mobile, la version ordinateur est utilisée (recadrée).
- Le texte doit être dans l’image elle-même : le site ne superpose pas de texte aux bannières.

**Liens et description** : modifiez `hero.json`. La 1re ligne correspond à `hero-1`, la 2e à `hero-2`, etc.
`href` = page ouverte au clic (ex. `/products?cat=electronique`), `alt` = description pour l’accessibilité.

Tant qu’aucune image `hero-N` n’est déposée, le site affiche un visuel de repli avec des produits du catalogue.
