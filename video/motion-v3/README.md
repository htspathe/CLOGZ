# CLOGZ V3 — projet motion modifiable

Quatre montages réellement rendus : master vertical 40 s, Reel 30 s, teaser 15 s, horizontal 43 s. 1080 × 1920 / 1920 × 1080, 30 images/s, MP4 H.264, audio AAC. Les versions « Musique » n’ont pas de voix ; les versions « Voix_Provisoire » incluent une narration française et une piste de sous-titres français activable. Les fichiers SRT restent éditables.

## Ouvrir l’aperçu
Décompresser le dossier entier puis ouvrir `preview.html`. Choisir le format, lire, mettre en pause ou déplacer le curseur. `seek(t)` affiche une image à une position temporelle exacte. Aucun démarrage automatique, y compris avec la préférence de réduction du mouvement.

## Modifier et exporter
Node.js 20+ et FFmpeg doivent être installés. Python nécessite numpy et scipy pour le son.

```sh
npm install
node interfaces.js
node render.js master stills
node render.js master
node render.js reel
node render.js teaser
node render.js youtube
python3 soundtrack.py
python3 finalize.py
```

`config.json` contient les résolutions et les durées. `motion.js` contient les scènes, positions, animations, transitions et la fonction temporelle commune. `interfaces.js` produit les illustrations de navigation à partir des vrais visuels et contenus V3. `render.js` utilise le même moteur que l’aperçu. `soundtrack.py` compose une musique et les effets sans sample tiers. `finalize.py` positionne les phrases, baisse la musique pendant la voix et produit les sous-titres sans accélérer la narration.

## État de cette livraison
Il s’agit d’une **préversion de production**, pas d’une validation intégrale du prompt final. Deux éléments nécessitent une finition avec les ressources adéquates :

- Les écrans sont des **illustrations du parcours V3**, signalées dans le film. Les pages de la sauvegarde V3 ont été récupérées, mais leur capture vidéo fidèle n’a pas pu être produite dans cet environnement. Les interactions sont des démonstrations graphiques ; aucune commande n’a été passée.
- La voix est **française provisoire**, et non la voix sénégalaise sélectionnée. Pour la remplacer, enregistrer les textes de `assets/narration.json` en neuf fichiers `voice-0.mp3` à `voice-8.mp3` et les phrases courtes dans les fichiers `short-*.mp3`. La génération d’une nouvelle voix n’est pas nécessaire pour reconstruire le projet : les pistes utilisées sont jointes.

Les dix vrais coloris, les logos officiels, les photos de personnalisation et les packs viennent de CLOGZ. Les prix des packs ne sont pas annoncés. Spider CLOGZ est présenté comme collection en préparation, sans prétendre à un partenariat officiel. Les pointures et conditions restent assorties de réserves. Les pins sont montrés via des photos d’inspiration authentiques ; leur pose individuelle et certains morphings du brief restent simplifiés.

Le montage conserve la palette, les polices, l’ordre des neuf scènes et le prix fournis. Les URL des médias et la référence du thème sont dans `SOURCES.md`. Aucune modification n’a été faite à Shopify.
