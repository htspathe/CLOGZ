# CLOGZ — Suivi de commande CZ-XXXXX (préparation technique)

**État :** code source de démonstration préparé, prêt à intégrer dans une application Shopify CLI. Voir `INSTALLATION_EXTENSION_REMERCIEMENT.md`. Tests unitaires locaux réussis. Ce projet n'est PAS activé sur la boutique publiée : les identifiants d'une application Shopify et le dispositif de limitation des requêtes restent à connecter.

## Ce qui existe déjà dans la boutique

- Shopify `clogz.sn`, domaine Admin API `clogz-sn.myshopify.com`.
- Page Shopify `/pages/suivi` et maquette `/pages/merci` sur thème de test `167776518204`.
- Définition Metaobject Shopify interne `clogz_private_tracking` avec `storefront: NONE`, `customerAccount: NONE`.
- Les commandes #1003, #1004, #1005 ont un champ privé `clogz_tracking.code`, et des Metaobjects privés correspondants.
- Aucune modification des stocks, paiements, expéditions ou notifications automatiques.

## Fonctionnement souhaité

1. Shopify crée la commande via son checkout sécurisé.
2. Le webhook `orders/create` de l'application privée appelle `/api/webhooks/orders-create` (HMAC Shopify vérifié).
3. Si aucun code n'existe, le service crée un code aléatoire `CZ-XXXXX` avec `crypto.randomInt()` et vérifie l'unicité du handle dans le registre privé Shopify. Ensuite, il écrit le champ `clogz_tracking.code` sur la commande avec compare-and-set.
4. Sur la page de remerciement Shopify, une **Checkout UI extension** utilise le JWT de session signé et le checkout token lié à la commande pour récupérer le code depuis `/api/checkout-code`.
5. Pour consulter le suivi, le navigateur poste le code à `/api/track`. Le serveur vérifie un limiteur global et par IP durable (Redis), retrouve la commande via le registre privé Shopify, et renvoie uniquement des statuts non personnels. **Aucun token Admin n'est exposé dans le navigateur.**

## Demande de modification du choix — pointure ou couleur

- **Avant le paiement** : dans le thème de test, le panier contient un éditeur de couleur et de pointure pour les sabots simples (le pack a son propre parcours). Il emploie exclusivement l'API Cart de Shopify pour modifier le panier, sans créer de commande.
- **Après la commande** : page publique `/pages/modifier-commande` avec formulaire de demande, lien depuis `/pages/suivi`, `/pages/merci` et l'extension « Thank You ». Le client renseigne un code `CZ-XXXXX` ou un numéro de commande, puis choisit un coloris et/ou une pointure ; un message prérempli s'ouvre sur WhatsApp Business.
- **Aucune modification automatique** : l'équipe CLOGZ vérifie manuellement la commande, la disponibilité, le prix éventuel et l'état d'expédition, puis confirme la modification. Les commandes déjà expédiées peuvent être refusées.
- **Aucune donnée personnelle révélée** par la recherche du code. Le formulaire de modification ne vérifie pas l'identité du client et ne doit pas être autorisé à changer les commandes Shopify automatiquement.
- **Extension Shopify** : le composant Thank You affiche un lien vers la page de demande (avec le code en fragment `#...` uniquement lorsqu'il a été obtenu du backend sécurisé), indépendamment de la réussite du chargement du code.

## Pré-requis pour activation réelle

- Créer/associer une application Shopify à CLOGZ sur le Dev Dashboard, disposer des scopes `read_orders`, `write_orders`, `read_metaobjects`, `write_metaobjects` et de l'autorisation pour les données de commande protégées si nécessaire.
- Configurer une variable chiffrée `SHOPIFY_ADMIN_TOKEN` dans le service backend (jamais dans le code ni dans le thème).
- Configurer `SHOPIFY_APP_CLIENT_SECRET` (pour HMAC des webhooks et JWT de l'extension) et `SHOPIFY_APP_CLIENT_ID`.
- Créer une base Redis REST compatible Upstash pour limitation anti-enumération : `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`.
- Déployer la passerelle, installer l'application Shopify et son extension `purchase.thank-you.block.render`, puis activer le bloc dans **Paramètres → Paiement → Personnaliser → Page de remerciement**.
- Enregistrer le webhook `orders/create` de cette application vers l'URL HTTPS `/api/webhooks/orders-create`.
- Effectuer un achat de test réel autorisé, contrôler l'attribution du code, la récupération de ce code sur la page Shopify Thank you et la lecture des statuts dans `/pages/suivi`.
- **Seulement après ces tests :** définir `TRACKING_ENABLED=1` et relier l'URL API à la page du thème Shopify publié, puis organiser les notifications SMS/WhatsApp selon le consentement client et l'API Meta approuvée.

## Variables d'environnement (à définir uniquement dans l'hébergeur)

```text
SHOPIFY_ADMIN_TOKEN             = <secret Shopify Admin API>
SHOPIFY_APP_CLIENT_SECRET       = <secret Shopify app pour HMAC/JWT>
SHOPIFY_APP_CLIENT_ID           = <Client ID public de cette application>
UPSTASH_REDIS_REST_URL          = <URL HTTPS Redis>
UPSTASH_REDIS_REST_TOKEN        = <secret Redis>
TRACKING_ENABLED                = 0
```

`TRACKING_ENABLED=0` par défaut : toute requête publique au suivi répond « service non configuré » ; aucune information de commande n'est exposée.

## Contrôle de statut

La page renvoie des états basés exclusivement sur les vrais champs Shopify. Les tags peuvent permettre la validation manuelle de jalons supplémentaires :

- `CZ_CONFIRMEE` : disponibilité confirmée par CLOGZ.
- `CZ_EN_LIVRAISON` : remise effective au livreur.
- `CZ_LIVREE` : livraison réellement confirmée.

Sans ces tags, la page n'invente pas de confirmation ni de livraison. Le statut financier reste distinct de l'expédition. Il ne faut **pas** marquer payé ou expédié pour déclencher un affichage.

## Précautions de sécurité

Le format demandé de **5 caractères** ne représente que 32⁵ = 33 554 432 possibilités. Il est insuffisant pour afficher des informations personnelles. Le serveur renvoie uniquement un statut de commande, jamais les coordonnées du client. Chaque recherche est limitée par IP et par boutique, et l'API échoue en mode fermé si le limiteur Redis ou les secrets sont absents. Ne supprime pas le limiteur pour « faire marcher » le site. Il est recommandé de garder l'extension checkout et l'envoi des liens indépendants des codes visibles publiquement, et d'ajouter WAF/anti-abus avant un trafic important.

## Tests

```bash
npm run check
npm test
```

Un test Shopify en production nécessite une autorisation d'application et une installation réelle ; ne pas créer de commande artificielle à partir d'e-mails ou de formulaires.
