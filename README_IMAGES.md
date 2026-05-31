Procédure pour télécharger et optimiser les images Unsplash localement

Prérequis:
- Node.js 18+ installé
- Connexion Internet sur la machine locale

Étapes:
1. Ouvrir un terminal dans le dossier du projet (`D:\CEBIG SARL`).
2. Installer les dépendances:

```powershell
npm install
```

3. Lancer le script d'optimisation (téléchargement + conversion WebP + génération manifest + mise à jour des références):

```powershell
npm run optimize-images
```

4. Après exécution:
- Les images optimisées se trouvent dans `images/` (fichiers `.jpg` et `.webp`).
- Un fichier `images/images-manifest.json` contient les chemins générés.
- Des sauvegardes des fichiers modifiés sont créées: `css/style.css.bak`, `index.html.bak`, `js/script.js.bak`.

Remarques:
- Le script utilise `source.unsplash.com` pour récupérer des images libres de droits. Respectez les conditions d'utilisation d'Unsplash si vous réutilisez les images.
- Si vous préférez fournir vos propres images, placez-les dans `images/` et adaptez `images/images-manifest.json` manuellement.

Support:
- Si vous souhaitez que j'exécute le script pour vous, je peux le lancer si l'environnement réseau devient disponible. Sinon, exécutez les commandes ci‑dessus sur votre machine locale.
