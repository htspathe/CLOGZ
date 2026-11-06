# CLOGZ V5 — Audit mobile, SEO, accessibilité et nettoyage (6 novembre 2026)

**Boutique :** https://clogz.sn  
**Source Shopify :** thème #168011890748 — « CLOGZ V5 — Audit SEO / Perf / Accès FCFA (TEST) », brouillon NON publié au moment de l'export.  
**Thème publié de référence :** #168011497532 — « CLOGZ V5 — Bandeau noir mobile corrigé (TEST) ».

## Périmètre de l'archive
- Copie intégrale du code texte du thème Shopify : 131 fichiers Liquid, CSS, JS, JSON et SVG. Les médias distants restent servis par le CDN Shopify ; aucun binaire tiers n'est redistribué.
- L'archive historique `theme/clogz-v5-2026-11-06` correspond à une capture antérieure du thème publié. Ne pas la confondre avec ce brouillon audité.
- Aucune modification du code du thème publié n'a été effectuée par cet audit.

## Changements appliqués au brouillon
- Footer : lien « Notre histoire » relié à `/pages/notre-histoire` ; « Notre univers » renvoie toujours à la page de personnalisation.
- Nouvelle page Shopify « Notre histoire » (`/pages/notre-histoire`), publiée séparément dans les données Shopify — **son contenu est une ressource Shopify et n'est pas inclus dans le thème**.
- FAQ et centre d'aide : tarif Spider-Man actuel **20 000 FCFA**, ancien tarif barré **22 500 FCFA**. Prix classiques 12 000 FCFA, packs DUO 21 000 FCFA, TRIO 30 000 FCFA.
- SEO : titre unique partagé entre `<title>`, `og:title` et `twitter:title`, limité à 60 caractères. Les JSON-LD `Organization` et `FAQPage` existants sont conservés ; la fiche produit utilise Shopify `product | structured_data`, dont l'offre utilise la devise **XOF**.
- Images du hero : génération de versions **600 px maximum par le CDN Shopify**, qui négocie WebP/AVIF selon le navigateur. Seules les trois paires visibles au départ ont un `src` immédiat ; les sept autres portent `data-src` et chargent à leur activation, avec `loading="lazy"`. Priorité haute uniquement sur le sabot noir actif. Les originaux source PNG demeurent sur Shopify.
- Images sous le hero : largeur CDN limitée à 600 px et chargement différé ; dimensions et descriptions alternatives dans les sections auditées.
- Loader initial plafonné à 1,8 s, bouton « PASSER » ; navigation accessible, libellés ARIA, contrastes renforcés pour les textes/boutons rouges, focus visible et respect de `prefers-reduced-motion`.

## Vérifications et limites
- 34 chemins internes du footer, de la FAQ et du centre d'aide vérifiés contre les pages et collections publiées dans Shopify : 34/34 résolus au niveau du catalogue. **Ce n'est pas un test HTTP ni une preuve de disponibilité en navigateur.**
- Aucun marqueur Meta Pixel / TikTok Pixel trouvé dans les fichiers du thème. Aucune application Meta ou TikTok installée dans la liste des apps Shopify. Les éventuels **pixels personnalisés dans Customer Events** n'ont pas pu être consultés : **activation NON confirmée**.
- **Parcours mobile de bout en bout NON validé** : pas de session navigateur interactive autorisée pour sélectionner une taille, passer une commande de test et recevoir réellement une confirmation WhatsApp.
- **PageSpeed Insights / LCP NON mesuré** dans cette exécution : objectif mobile < 2,5 s à contrôler après publication ou aperçu accessible.
- Les versions WebP/AVIF sont servies par la conversion automatique du CDN Shopify ; aucun remplacement physique des dix PNG d'origine n'a été fait. Cette méthode préserve les fiches produit existantes.
- Page Shopify « Notre histoire » publiée dans l'administration. Les autres changements du code sont dans un thème non publié au moment de l'export.

## Pour valider avant mise en ligne
1. Ouvrir `https://clogz.sn/?preview_theme_id=168011890748` sur un iPhone et un ordinateur, vérifier le titre, les images, le ticker et le carrousel.
2. Dans un parcours de test autorisé, confirmer la pointure, l'ajout au panier et l'étape Shopify puis vérifier l'envoi Alintro/WhatsApp sans créer d'achat réel.
3. Contrôler **Shopify > Paramètres > Événements clients** et les applications officielles Meta/TikTok avant de diffuser de la publicité.
4. Mesurer LCP, CLS et INP dans `https://pagespeed.web.dev/` en mobile, après publication.
