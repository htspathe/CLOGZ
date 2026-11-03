# Architecture et provenance des sources

```text
www.clogz.sn  → Shopify Online Store (thème publié à récupérer séparément)
                  ├── Catalogue et variantes Shopify
                  ├── Checkout natif / paiements Shopify
                  ├── Pages produit, packs, panier, suivi à valider
                  └── Notifications e-mail + applications tierces

Dossier theme/starter-os2-2026-10-23/    → starter OS2 historique (non publié)
Dossier apps/order-tracking-prototype/  → API Node/Vercel + Upstash Redis + app Shopify/Checkout UI (non activés)
Dossier marketing/clogz-marketing-studio/ → 12 skills de travail ChatGPT
Dossier video/motion-v3/               → moteur de montage JS/Python (médias non joints)
```

## Versions Shopify identifiées dans les archives/conversations
- 23 octobre : starter `CLOGZ-Shopify-OS2-CORRIGE.zip` : **c'est la source du thème présente ici**, pas l'état réel de la boutique.
- 25–26 octobre : prototype V2 immersif / cartes couleurs, sur thème de test ; produit final non exporté ici.
- 29 octobre : thème V3 unifié de test avec suivi/GPS/international ; code de l'application de suivi en archive, déploiement séparé requis.
- 30 octobre : demandes d'uniformisation typographique, correction panier, audit et variantes V4, **sans archive complète du thème publié**.

## Pour ajouter le vrai thème actuel
1. Dans Shopify Admin > Boutique en ligne > Thèmes, identifier le thème publié et dupliquer en brouillon.
2. Exporter **cette copie** via Shopify CLI ou téléchargement autorisé.
3. Conserver les fichiers du thème dans `theme/current-export-YYYY-MM-DD/` avec provenance, date, SHA, numéro de thème et statut publié/brouillon.
4. Exclure paramètres sensibles, clés et données clients ; vérifier avant commit.
5. Comparer à un état de sauvegarde avant toute modification et tester sur un thème non publié.

Ne pas activer de publication automatique GitHub → Shopify sans vérification, rollback et autorisation du propriétaire.
