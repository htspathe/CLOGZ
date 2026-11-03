# Sécurité, données personnelles et droits

Le dépôt GitHub est **public**. Ne jamais y committer :
- `.env`, secrets Shopify Admin/Storefront, clé d'application, mot de passe, cookie/session, WATI/Meta token, clé DNS, clés SPF/DKIM privées, clé Upstash Redis, token Cloudflare, Github PAT, e-mail personnel.
- Exports des commandes/clients, numéros de téléphone, positions GPS, adresses, liens personnels de suivi, captures de conversations clients, codes de suivi réels.
- Certificats privés, fichiers de configuration contenant des identifiants actifs.

Les `.env.example` sont délibérément vides. Définir les secrets seulement sur les hébergeurs concernés, avec permissions minimales et rotation. Vérifier les webhooks signés (HMAC), limiter les recherches `CZ-XXXXX` contre l'énumération, et ne jamais exposer des données de commande via un code court.

La version d'application de suivi intégrée est un **prototype**, à auditer avant utilisation. Seule une application Shopify correctement installée, un serveur sécurisé et Redis permettent d'activer la fonction.

**Images, logos et licences :** ne pas copier les photos stock, musiques, fontes commerciales, personnages ou marques de tiers sans droit de redistribution. Les motifs Spider-Man dans le catalogue n'établissent pas de licence officielle ; éviter toute affirmation de partenariat Marvel/Disney. Les scripts sont des propositions créatives, à valider juridiquement si les motifs doivent être diffusés en ads.

**Promotions :** « Tu pensais 30 000 FCFA ? Chez CLOGZ 22 500 » est une accroche hypothétique, jamais la preuve d'un prix d'origine ni d'une réduction réelle.

**Procédure avant toute publication :** sauvegarde, vérification, audit secrets, tests, approbation, puis lancement. Aucun secret ni branche CI/CD de production dans ce référentiel.
