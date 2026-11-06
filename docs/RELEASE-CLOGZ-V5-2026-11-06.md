# CLOGZ — export du thème Shopify V5

**Date de capture :** 6 novembre 2026  
**Domaine boutique :** https://clogz.sn  
**Source Shopify :** `gid://shopify/OnlineStoreTheme/168011497532`  
**Nom :** CLOGZ V5 — Bandeau noir mobile corrigé (TEST)  
**Rôle observé à l'export :** `MAIN` (publié)  
**Code versionné :** [`theme/clogz-v5-2026-11-06/`](../theme/clogz-v5-2026-11-06/)  
**Nombre de fichiers :** 131 (65 Liquid, 29 CSS, 19 JavaScript, 17 JSON, 1 SVG).

## Inclus dans cet instantané

- Architecture Shopify OS 2.0 : `layout/`, `sections/`, `snippets/`, `assets/`, `templates/`, `config/`, `locales/`.
- Design **ZINE DIY / Streetwear** : navigation et typographies harmonisées, couleurs CLOGZ, sections éditoriales, grilles produits, packs, page panier, suivi et contacts.
- Accueil avec photographie du **Monument de la Renaissance** provenant du CDN Shopify, bandeau noir d'annonces et carrousel mobile/desktop des coloris (y compris le gris ardoise).
- Ajustements mobile pour le logo, le bouton MENU, la barre noire, le swipe tactile, les boutons et l'absence de bandeau d'annonces en double.
- Fiches produits et cartes de catalogue avec variantes, pointures, images, traitement des fonds et logique panier.
- Promotion Spider-Man affichée via les données du catalogue : **20 000 FCFA** avec ancien prix barré **22 500 FCFA** pour les coloris rouge, noir et bleu.

## Limites importantes

1. **Aucun déploiement GitHub → Shopify n'a été effectué.** Ce dossier est un instantané du thème ; les changements ultérieurs dans Shopify ne seront pas synchronisés automatiquement.
2. Les photos et autres médias **restent hébergés sur le CDN Shopify** ; leurs URL sont référencées dans les fichiers Liquid/CSS/JSON. Aucun média binaire externe n'a été copié dans GitHub.
3. Les **produits, variantes, prix administratifs, stocks, clients et commandes** résident dans Shopify, et non dans le thème. Le code ne doit pas être utilisé pour modifier les stocks ou forcer des achats d'articles indisponibles.
4. Les applications, la configuration Meta/WhatsApp et les autorisations ne sont pas exportées ; les modules dépendant d'apps doivent être revérifiés sur la boutique cible.
5. Le dépôt est **public** : l'export ne doit jamais accueillir de tokens API, de données client ou de fichiers `.env`. Un contrôle de motifs de secrets courants a été effectué lors de la préparation de cette copie, mais n'est pas un audit de sécurité exhaustif.

## Vérification et maintenance

Avant de réimporter le dossier dans Shopify, exécuter `shopify theme check` avec Shopify CLI, puis tester dans un thème **non publié** : accueil, navigation mobile, ajout au panier, checkout, packs, suivi, collecte des données et performance sur smartphone. Ne pas publier automatiquement.

L'ancienne archive [`theme/starter-os2-2026-10-23/`](../theme/starter-os2-2026-10-23/) et les applications/projets du dépôt sont conservés.
