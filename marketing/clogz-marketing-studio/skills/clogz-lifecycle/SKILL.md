---
name: clogz-lifecycle
description: Concevoir messages transactionnels et de fidélisation avec consentement.
---

# WhatsApp et e-mails clients

Distinguer notifications **transactionnelles** (confirmation, expédition, livraison, suivi) des communications **marketing** (réachat, promotions, paniers abandonnés). Vérifier consentement, politiques de messagerie et possibilité d’opt-out.
Workflow : panier abandonné si système et consentement appropriés, confirmation, statut de commande, délai après livraison, demande d’avis authentique puis offre de réachat.
Pour chaque message : déclencheur, canal, condition de consentement, délai, texte court, variables `{{prenom}}`, `{{commande}}`, `{{lien_suivi}}`, règle d’exclusion, métrique.
Ne pas envoyer de données client sensibles dans un message public. Ne jamais promettre une automatisation active sans preuve dans Shopify/Alintro.
Respecter politesse locale ; format SMS/WhatsApp lisible, sans fausse urgence ou pression. Ne pas déclencher d’envoi réel sans autorisation.

## Règles communes

Lire `../clogz-brand-context/references/CLOGZ.md` quand disponible. Distinguer **données vérifiées**, **hypothèses** et **propositions**. Ne rien modifier, envoyer ni publier sans demande explicite. S’appuyer sur des sources fraîches quand le diagnostic concerne l’état actuel du site ou la concurrence.

## Sources méthodologiques (inspiration, pas copie du contenu)

- coreyhaines31/marketingskills `emails`, `sms`; realjaymes/marketingagentskills `lifecycle-marketing-campaigns`
- https://github.com/coreyhaines31/marketingskills
- https://github.com/realjaymes/marketingagentskills
