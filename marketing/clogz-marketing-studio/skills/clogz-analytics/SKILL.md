---
name: clogz-analytics
description: Concevoir plan de mesure e-commerce fiable et tableau de bord.
---

# Mesure Shopify et campagnes

Définir un dictionnaire unique : sessions, vues de fiches, taux d’ajout panier, début checkout, conversion achat, panier moyen (AOV), revenu, marge contributive, CAC/CPA, ROAS, achats récurrents.
Événements proposés : page_view, view_item, select_item, add_to_cart, view_cart, begin_checkout, add_payment_info (si disponible/autorisé), purchase (avec currency XOF et value numérique).
Vérifier déduplication purchase, serveur/pixel, canal COD (paiement livraison) et différence commande créée vs encaissée/annulée.
Tableau hebdomadaire : trafic source, commandes confirmées, CA facturé, CA réellement encaissé si accessible, dépenses, marge, problèmes observés.
Ne jamais inventer métriques. En cas de manque de données, livrer un modèle de collecte et expliquer ce qui peut/ne peut pas être attribué.

## Règles communes

Lire `../clogz-brand-context/references/CLOGZ.md` quand disponible. Distinguer **données vérifiées**, **hypothèses** et **propositions**. Ne rien modifier, envoyer ni publier sans demande explicite. S’appuyer sur des sources fraîches quand le diagnostic concerne l’état actuel du site ou la concurrence.

## Sources méthodologiques (inspiration, pas copie du contenu)

- coreyhaines31/marketingskills `analytics`, `conversion-tracking`; realjaymes/marketingagentskills `product-marketing-metrics`
- https://github.com/coreyhaines31/marketingskills
- https://github.com/realjaymes/marketingagentskills
