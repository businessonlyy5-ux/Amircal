# Photos des avis clients

Ce dossier contient les photos affichées dans le carrousel d’avis des fiches produit.

**Règle importante : n’utilisez que de vrais avis, de vrais clients, avec leur accord.** Les faux avis et les photos de personnes qui n’ont pas acheté sont interdits (aux États-Unis, la FTC les sanctionne) et détruisent la confiance.

## Ajouter un avis

1. Déposez la photo ici (GitHub : Add file → Upload files). Carrée de préférence, 400 × 400 px, moins de 100 Ko, `.jpg` ou `.webp`. Exemple : `marie.jpg`.
2. Dans Supabase, table **`testimonials`**, ajoutez une ligne :
   - `author_name` : prénom (ex. Marie)
   - `rating` : 1 à 5
   - `body` : le texte de l’avis
   - `photo_path` : `/reviews/marie.jpg` (laisser vide pour afficher l’initiale)
   - `product_supplier_id` : identifiant du produit (le nombre dans l’adresse `/products/12345`) pour un avis propre à ce produit
   - `category_slug` : par ex. `electronique` pour un avis affiché sur tous les produits de cette catégorie
   - laissez les deux vides pour un avis général affiché partout
   - `verified_purchase` : `true` seulement si c’est un achat réel chez vous (affiche le badge « Achat vérifié »)
   - `is_published` : `true` pour le rendre visible

Sur une fiche produit, le carrousel montre d’abord les avis du produit, puis ceux de sa catégorie, puis les avis généraux (4 au maximum). Sans avis publié, la fiche affiche « Soyez le premier à donner votre avis ».
