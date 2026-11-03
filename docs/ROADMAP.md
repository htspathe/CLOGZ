# Feuille de route CLOGZ

## Priorité P0 — avant d'accélérer la publicité
1. Exporter et versionner le **thème Shopify réellement publié**. Déterminer précisément quelle V3/V4 est en ligne.
2. Tests mobile iOS/Android : collection → variante → panier → checkout → commande réelle test → confirmation ; corriger « can't find variable » s'il persiste.
3. Vérifier toutes les options et le stock **par pointure et par coloris** ; confirmer que DUO/TRIO décomptent les bons articles.
4. Vérifier le périmètre de livraison gratuite Dakar, délai affiché, frais hors zone et pays (dont France).
5. Réviser la conformité des noms « Crocs », « Spider-Man », contenus dérivés, logos et effets publicitaires ; ne jamais laisser supposer une licence non détenue.

## P1 — suivi et services
1. Confirmer l'état de la page `/pages/suivi` et ses droits d'accès.
2. Déployer uniquement après audit le backend `CZ-XXXXX` avec Shopify app, secrets en variables et Upstash Redis + WAF.
3. Tester l'extension de remerciement Checkout UI : référence réelle, code, lien suivi, consentement et erreurs.
4. Assurer les demandes de changement de pointure/couleur **manuellement et avant expédition**.
5. Finaliser la stratégie notifications WhatsApp : comparer Alintro/WATI, état officiel des templates et consentement, ne pas envoyer en double.

## P2 — marketing / mesure
1. Audit SEO réel : canonicals, sitemap, indexation, mots-clés, FAQ structurée, images WebP et Core Web Vitals.
2. Vérifier pixel Meta, événements ViewContent/AddToCart/InitiateCheckout/Purchase et qualité des consentements.
3. Produire 3 variantes publicitaires avec vraies images produits ; comparer une créa produit à une créa marque sans produits.
4. Mettre en place le tableau de bord Shopify (sessions, panier, commandes, CPA et marge **réellement vérifiés**).
5. Documenter l'expérience des premières campagnes avant d'augmenter le budget.
