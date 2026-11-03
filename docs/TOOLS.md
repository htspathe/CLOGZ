# Outils, connecteurs et compétences employés/envisagés

| Outil | Usage projet | Statut prudent |
|---|---|---|
| Shopify | Catalogue, variants, paiements, commandes, thèmes | boutique existante, vérifier thème publié |
| Wanekoo | Domaine `clogz.sn`, DNS, e-mail | configuration engagée |
| Google Search Console | Indexation/sitemap/SEO | soumis dans les échanges, à vérifier |
| Gmail / messagerie pro | Contacts, support et notifications | adresses définies ; SPF/DKIM/DMARC à revérifier |
| Meta Business Suite / WhatsApp | Messagerie et business assets | intégrations évolutives, ne pas revendiquer d'API active sans test |
| Alintro SMS WA Notify | Notifications Shopify WhatsApp | installée/testée selon les échanges |
| WATI / API WhatsApp | Autre piste de notifications | configuration explorée, circuit direct en pause |
| Cloudflare Worker | Exemple de backend webhook | expérimentation mise en pause |
| Vercel / Upstash Redis | Prototype suivi de commande sécurisé | **non déployé**, Redis à configurer |
| GitHub | Versionner code, documentation et scripts | ce dépôt est un référentiel de travail, pas un CI/CD |
| ChatGPT CLOGZ Marketing Studio | 12 skills marketing | fichiers sources inclus dans `marketing/clogz-marketing-studio/` |
| Canva, Adobe, image generation | Images publicitaires et retouches | assets non reproduits ici par défaut |
| Claude, Remotion, FFmpeg, Node.js/Python | Scripts et montage vidéo | source motion V3 incluse, médias binaires séparés |
| Pexels, Mixkit, Pixabay, Coverr | Clips de stock pour pubs | respecter la licence **de chaque clip** |
| Judge.me | Widgets d'avis clients | installation signalée ; vérifier activation thème |

## 12 skills marketing CLOGZ
`clogz-brand-context`, `clogz-strategy`, `clogz-seo`, `clogz-copywriting`, `clogz-cro`, `clogz-social`, `clogz-ads`, `clogz-ad-creative`, `clogz-lifecycle`, `clogz-analytics`, `clogz-experiments`, `clogz-gtm`.

Méthodes inspirées de [`coreyhaines31/marketingskills`](https://github.com/coreyhaines31/marketingskills) et [`realjaymes/marketingagentskills`](https://github.com/realjaymes/marketingagentskills), **pas les deux dépôts copiés intégralement**.

Le plugin privé ChatGPT s'appelle *CLOGZ Marketing Studio*, v1.0.0. Copier ses sources dans GitHub **ne l'installe pas automatiquement** dans un autre compte ni n'active d'autres connecteurs.
