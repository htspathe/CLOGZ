# État du projet au 3 novembre 2026

Cette synthèse croise les décisions prises dans les échanges et les archives récupérées. Elle **n'est pas un audit live** du thème ou des applications Shopify. Les états marqués « à vérifier » doivent être contrôlés dans les administrations concernées.

## Boutique et domaine
- Shopify : boutique **CLOGZ** sur `clogz.sn` / `www.clogz.sn` ; domaine administrateur `clogz-sn.myshopify.com`.
- Domaine acquis chez Wanekoo, DNS et HTTPS configurés précédemment ; vérifier l'URL finale et le certificat avant une campagne.
- Identité : marque CLOGZ, monogramme rond CZ, baseline **DEY DAW REK**, style minimaliste urbain.
- Dix coloris de sabots classiques actifs lors de la dernière consultation : noir, rouge, blanc, beige, vert forêt, rose bonbon, bleu ciel, lilas, orange, gris, **12 000 FCFA**.
- Packs DUO **21 000 FCFA** et TRIO **30 000 FCFA** ; validation du décompte stock unitaire nécessaire.
- Trois produits thématiques Spider-Man actifs dans le catalogue Shopify consulté le 3 novembre : **rouge, noir, bleu**, **22 500 FCFA**. Ne pas affirmer de collaboration officielle Marvel sans licence.

## Expérience et ventes
- Plusieurs variantes du thème ont été créées : Street Pop / V2 Immersive / V3 Cartes couleurs / sauvegardes V3 / travaux V4. L'état exact du thème publié doit être **relu dans Shopify**, il n'est pas certifié par ce dépôt.
- Les pages accueil, collections, produit, packs, panier, contact, suivi et FAQ ont fait l'objet de demandes d'amélioration : mobile, suppression de textes, cohérence typographique, géolocalisation de livraison (consentement utilisateur), panier complet, personnalisation. **Ne pas inférer leur publication ou leur fonctionnement à partir des demandes.**
- Paiement à la livraison et livraison à Dakar figurent dans les parcours envisagés et tests ; vérifier les zones/délais/moyens de paiement effectifs.
- Les boutiques Shopify peuvent avoir des données de stock contradictoires ; tester les variantes réelles et les ventes impossibles avant la publicité.

## Commandes / suivi / WhatsApp
- Format cible : **CZ-XXXXX** ; interface de suivi sans compte. Code du backend disponible dans `apps/order-tracking-prototype/`. Dernière archive du 29 octobre : **non activé en production**.
- Événements : commande reçue → confirmée → en livraison → livrée. N'afficher un statut que s'il est justifié par les champs Shopify ou une action réelle validée.
- Modification couleur/pointure : demande **manuelle avant expédition**, pas mutation automatique de commande.
- WhatsApp Business : essais Meta/WATI et Alintro. Alintro utilisé dans des tests ; automatisation et webhooks non certifiés actifs. Développement Cloudflare Worker / WATI laissé en pause.

## Marketing / médias
- Présence sociale : Instagram, TikTok, Threads `@clogz221`, Facebook, WhatsApp Business.
- Emails professionnels : `contact@clogz.sn`, `support@clogz.sn`, `commandes@clogz.sn` ; authentification SPF/DKIM étudiée ; DMARC à vérifier.
- SEO : Search Console/sitemap, titres/metas et requêtes ciblées « sabots Dakar », « crocs Dakar » (attention usage de marque tierce) ; performances mobile et rich results à revalider.
- **CLOGZ Marketing Studio v1.0.0** : 12 workflows/skills documentés dans ce dépôt ; pas d'accès automatique au compte publicitaire ni d'achat d'espace.
- Projets vidéos : CLOGZ V3 motion design ; scripts lifestyle, vidéo sans paires, campagne Spider-Man avec contraste « Tu pensais 30 000 ? 22 500 FCFA » sans prétendre à une baisse réelle du prix.

## Ce qui n'est pas garanti
- Déploiement du code depuis GitHub vers Shopify : **non configuré**.
- Thème actif V4 et dernière version du thème : **non exportés dans cette archive**.
- Génération du code de suivi, page de remerciement app et notifications automatiques : **pas validés en production**.
- Stocks par variante, CPA/ROAS, conversions et budgets pubs : **ne pas inventer**.
