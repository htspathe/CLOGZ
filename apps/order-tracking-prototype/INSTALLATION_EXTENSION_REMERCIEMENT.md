# CLOGZ — Installer l'extension de remerciement Shopify

**État au 29/10/2026 : fichiers préparés et tests locaux ; pas d'installation ni d'activation sur la boutique.**

## Ce qui a été vérifié

- La boutique Shopify CLOGZ est `clogz-sn.myshopify.com` et le thème de test unifié est `167776518204`.
- Shopify n'indique **aucune application « CLOGZ Suivi » installée**.
- Le compte Vercel connecté ne présente **aucun projet CLOGZ existant**.
- Le thème ne peut pas installer lui-même une Checkout UI Extension : elle appartient à une application Shopify.

## Installation de l'application (sur un ordinateur disposant de Shopify CLI et d'un accès développeur autorisé)

1. Créer une application personnalisée **CLOGZ Suivi** depuis `https://dev.shopify.com` (ou initialiser le projet avec `shopify app init`) et la lier à la boutique `clogz-sn.myshopify.com`.
2. Utiliser `shopify app generate extension --template checkout_ui` pour générer l'ossature d'une Checkout UI extension. Remplacer le contenu du module JSX par `extensions/clogz-merci/src/ThankYou.jsx` et adapter `shopify.extension.toml` dans le projet créé ; conserver l'identifiant UID attribué par Shopify CLI.
3. Cibler `purchase.thank-you.block.render` et recommander la position `ORDER_STATUS1`. Le fichier TOML de ce dossier inclut la déclaration du bloc et son paramètre `api_url`.
4. Demander/autoriser la capacité **network_access** dans le Dev Dashboard de l'application (API access requests). La requête réseau requiert cette capacité, même si le bloc d'information statique fonctionne sans elle.
5. Créer le service HTTPS backend et y configurer les secrets `SHOPIFY_ADMIN_TOKEN`, `SHOPIFY_APP_CLIENT_ID`, `SHOPIFY_APP_CLIENT_SECRET`, ainsi qu'un Redis Upstash REST pour limiter les tentatives. **Ne jamais mettre ces secrets dans un thème ou dans le paramètre public `api_url`.**
6. Configurer le webhook signé `orders/create` vers `/api/webhooks/orders-create`. L'application aura besoin des scopes `read_orders`, `write_orders`, `read_metaobjects`, `write_metaobjects` et des permissions adaptées pour accéder aux données de commandes.
7. Déployer l'application/extension avec **`shopify app deploy`** et l'installer sur la boutique. Dans Shopify Admin, ouvrir **Paramètres > Paiement > Personnaliser > Page de remerciement > Ajouter un bloc d'application**. Choisir **CLOGZ — Merci et suivi**, placer le bloc près de l'en-tête de commande et enregistrer.
8. Dans les réglages du bloc, saisir l'URL **HTTPS** du backend dans `URL du service CLOGZ` (sans `/api/checkout-code`). Si le backend est absent, laisser le champ vide : le bloc affiche un message et les liens de contact, jamais de faux code.
9. Réaliser une **commande test autorisée** et vérifier : confirmation Shopify, création du code `CZ-XXXXX`, affichage du numéro réel `#...`, lien de suivi, demande de changement avant expédition, rechargement et compatibilité mobile.
10. Activer le service de suivi sur la boutique uniquement après les tests. **Ne pas publier le thème unifié avant la validation du parcours panier/paiement.**

## Comportement attendu

- Un remerciement avec une référence de commande Shopify correctement identifiée.
- Lorsque l'API sécurisée renvoie le vrai code : affichage de `CZ-XXXXX`, lien `https://clogz.sn/pages/suivi#CZ-XXXXX`, bouton « Demander une modification ».
- Si l'API n'est pas disponible ou la commande encore en création : texte d'attente et contact WhatsApp, **aucun code fictif**.
- Aucune modification automatique du stock, du paiement ou de la livraison n'est effectuée depuis le bloc.

## Pourquoi le numéro n'est pas toujours #1004 au premier chargement

L'API `orderConfirmation.number` peut renvoyer une référence alphanumérique de confirmation distincte du numéro habituel Shopify. Notre extension n'affiche le `#1004` réel que lorsque l'API privée confirme `Order.name` de cette même commande après vérification de la session et du jeton de checkout.

## Contrôles réalisés dans cette archive

- `npm run check` vérifie les modules backend.
- `npm test` vérifie le format des codes, la séparation des statuts financiers/logistiques et l'authenticité du JWT Shopify.
- L'extension JSX fait l'objet d'un contrôle syntaxique local, **mais aucun build Shopify CLI ni essai sur une vraie page de remerciement n'a été réalisé**.

Documentation officielle :
- https://shopify.dev/docs/apps/build/checkout/thank-you-order-status
- https://shopify.dev/docs/api/checkout-ui-extensions/latest/targets/thank-you/block
- https://shopify.dev/docs/api/checkout-ui-extensions/latest/target-apis/checkout-apis/order-api
- https://shopify.dev/docs/apps/build/checkout/capabilities
