L'INCIDENCE — prototype v3 / Pages CMS

Architecture
------------
- Site statique HTML/CSS/JS.
- Contenu des épisodes : content/episodes.json.
- Configuration CMS : .pages.yml.
- Médias : media/images/ et media/audio/.
- Pages CMS édite directement le dépôt GitHub ; le site lit ensuite episodes.json.

Pages CMS
---------
1. Mettre ce dossier dans un dépôt GitHub.
2. Ouvrir https://app.pagescms.org/ et se connecter avec GitHub.
3. Installer l'application GitHub Pages CMS sur le dépôt.
4. Ouvrir le dépôt : la configuration .pages.yml est détectée.
5. Dans « Épisodes », créer ou modifier un épisode.

Publication du site
-------------------
Le site doit être servi par un hébergeur statique (par exemple GitHub Pages, Cloudflare Pages ou Netlify).
Chaque modification faite dans Pages CMS est enregistrée dans GitHub ; l'hébergeur peut alors redéployer automatiquement le site.

Prévisualisation locale
-----------------------
Comme le site charge content/episodes.json avec fetch(), ne pas ouvrir index.html directement avec file://.
Lancer par exemple :

  python3 -m http.server 8000

puis ouvrir http://localhost:8000/

Audio
-----
Le champ audio est volontairement vide dans le prototype. Lorsque l'hébergeur podcast sera choisi, nous pourrons soit stocker un fichier audio dans media/audio/, soit adapter le champ pour utiliser l'URL fournie par l'hébergeur.

Important
---------
Le contenu éditorial réel de l'épisode 1 n'a pas été inventé ni finalisé ici.
