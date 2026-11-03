# CLOGZ — boutique, code et marketing

> Référentiel de travail CLOGZ · état de compilation : **3 novembre 2026** · site : [www.clogz.sn](https://www.clogz.sn)

Ce dépôt regroupe les **sources récupérées**, les procédures de configuration, la stratégie et les contenus créatifs du projet **CLOGZ**, boutique Shopify sénégalaise de sabots urbains.

**Attention : ce dépôt n'est PAS une copie certifiée du thème Shopify actuellement publié.** Le thème inclus est une archive d'un **starter OS 2.0 daté du 23 octobre 2026** ; la version actuellement en ligne et les réglages d'applications doivent être exportés depuis Shopify avant toute synchronisation. Le code de suivi commande est un **prototype non activé**. Aucun déploiement n'est lancé par ce dépôt.

## Organisation

| Dossier | Contenu | Statut |
|---|---|---|
| `theme/starter-os2-2026-10-23/` | 38 fichiers Liquid/CSS/JS/config d'une archive historique | prototype, **pas thème actif** |
| `apps/order-tracking-prototype/` | API de codes `CZ-XXXXX`, extension de remerciement Shopify, tests | préparé, **non déployé** |
| `marketing/clogz-marketing-studio/` | plugin privé de travail : 12 skills marketing et référentiel de marque | sources vérifiées |
| `video/motion-v3/` | code et scripts du montage CLOGZ V3, sous-titres et manifeste de médias | code disponible, médias binaires non inclus |
| `marketing/campaigns/` | scripts publicitaires et briefs de production | brouillons créatifs |
| `docs/` | état réel, architecture, opérations, configuration, outils, sécurité et feuille de route | documentation de référence |

## Informations de référence (à revérifier dans Shopify avant diffusion)

- Site : **www.clogz.sn** ; boutique Shopify : `clogz-sn.myshopify.com`.
- Slogan : **DEY DAW REK** ; style jeune, streetwear, minimaliste, mobile-first.
- Sabots classiques : **12 000 FCFA** ; pack DUO **21 000 FCFA** ; TRIO **30 000 FCFA**.
- Sabots à motifs Spider-Man : **22 500 FCFA**. Couleurs vues dans le catalogue le 3 novembre : **rouge, noir et bleu**.
- Livraison gratuite annoncée dans Dakar (périmètre précis à contrôler avant campagnes) ; paiement à la livraison parmi les options de paiement.
- 10 couleurs classiques : noir, rouge, blanc, beige, vert forêt, rose bonbon, bleu ciel, lilas, orange et gris.

## Prise en main

1. Lire [`docs/STATUS.md`](docs/STATUS.md) et [`docs/ROADMAP.md`](docs/ROADMAP.md).
2. Pour le starter Shopify, utiliser un **thème de test**, jamais pousser directement vers le publié.
3. Pour l'application de suivi : `cd apps/order-tracking-prototype && npm run check && npm test`. **Ne pas déployer sans installer et valider l'application Shopify ainsi que Redis.**
4. Pour le marketing, consulter [`marketing/clogz-marketing-studio/README.md`](marketing/clogz-marketing-studio/README.md) et [`marketing/campaigns/`](marketing/campaigns/).
5. Pour les vidéos, voir [`video/motion-v3/README.md`](video/motion-v3/README.md) ; les fichiers média lourds doivent être fournis séparément.

## Sécurité / licences

Dépôt **public** : pas de jetons API, mots de passe, numéros de commande clients, adresses de livraison, fichiers `.env`, exports de clients ni secrets DNS. Les valeurs sont des **exemples vides**. Les logos et images de tiers ne donnent pas, par leur présence dans Shopify, de droits de redistribution ; les médias binaires sont exclus du dépôt texte. Voir [`docs/SECURITY.md`](docs/SECURITY.md) et [`docs/ASSETS.md`](docs/ASSETS.md).

Le travail est incrémental. Pour toute évolution, documenter la date, le canal, l'état (publié / testé / projeté) et les preuves des vérifications. Ne jamais confondre mockup, code préparé et fonctionnalité active.
