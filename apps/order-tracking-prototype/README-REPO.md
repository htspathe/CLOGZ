# Important : prototype, non actif

Fichiers sources récupérés d'une archive du **29 octobre 2026**. Ce n'est pas une application installée et testée en production. Ne jamais faire correspondre un code `CZ-XXXXX` à des informations personnelles sans contrôle d'accès robuste ; le service donne seulement des statuts généraux. `TRACKING_ENABLED=0` par défaut et Redis/Shopify app secrets sont requis.

La version d'origine contenait un contact WhatsApp codé en dur : il a été remplacé dans le code public par une redirection générique vers `www.clogz.sn`. Configurer ensuite un canal d'assistance autorisé via les paramètres d'application, **pas en plaçant un numéro privé dans le dépôt**.

Le domaine `clogz-sn.myshopify.com` est celui de la boutique connectée au moment de la préparation. Confirmer la valeur `SHOPIFY_SHOP_DOMAIN` sur l'hébergeur. Avant toute activation, lire `INSTALLATION_EXTENSION_REMERCIEMENT.md`, tester la conformité de la Checkout UI extension et du parcours sécurisé.
