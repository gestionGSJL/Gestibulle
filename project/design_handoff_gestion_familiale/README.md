# Handoff: Gestion Familiale (app mobile de gestion familiale)

## Overview
Application mobile familiale à deux comptes ("Moi" / conjoint·e) couvrant : calendrier partagé, tâches/comptes récurrents avec preuve de paiement, planification de repas assistée par IA, liste d'épicerie liée aux recettes, notifications et paramètres. Objectif : remplacer les rappels papier/SMS entre les deux personnes du foyer.

## About the Design Files
Les fichiers de ce dossier sont des **références de design en HTML** (prototype cliquable construit avec un moteur de composants interne) — ils montrent l'apparence et le comportement voulus, ce n'est **pas du code de production à copier tel quel**. La tâche consiste à **recréer ces designs dans l'environnement cible** (React Native, Flutter, Swift/Kotlin natif, ou app web responsive — à choisir selon les besoins : multi-plateforme mobile, notifications push natives, synchronisation entre comptes) en utilisant ses patterns et librairies établis.

`Gestion Familiale.dc.html` est le fichier principal — ouvrez-le dans un navigateur pour voir/interagir avec le prototype complet. `ios-frame.jsx` et `image-slot.js` sont des utilitaires du prototype (bezel iPhone, emplacement d'image glisser-déposer) — ignorer, ne pas porter dans l'app finale.

## Fidelity
**Haute fidélité (hifi)** pour la structure, la navigation, les flux d'interaction et le contenu — recréer pixel-perfect les layouts, textes et logiques d'état décrits ci-dessous. Les couleurs/typographie viennent d'un design system nommé "Organic" avec 4 palettes alternatives (voir Design Tokens) — le développeur doit les recréer exactement.

## Screens / Views

### 1. Accueil / Aujourd'hui
- **Purpose**: résumé quotidien — état des tâches, repas du soir, agenda du jour.
- **Layout**: colonne unique, padding horizontal 22px. En-tête (nom + date), 2 cartes stats côte à côte (gap 12px), carte "Aujourd'hui" (agenda + tâches du jour, swipe gauche/droite pour changer de jour), carte "Ce soir" (repas), liste "À faire bientôt" (tâches datées des 10 prochains jours, excluant aujourd'hui).
- **Components**:
  - Icône engrenage (top-right, 38×38px, cercle `--color-neutral-100`) ouvrant Paramètres ; badge rouge (`--color-accent-500`, 18×18px, cercle, bordure 2px `--color-bg`) affichant le nombre de tâches du jour non complétées.
  - 2 cartes stats : "X tâches à faire" (fond `--color-accent-100`), "X/7 repas planifiés" (fond `--color-accent-2-100`).
  - Carte "Aujourd'hui" : liste d'événements (point coloré par personne + titre + heure) et tâches (checkbox + titre + tag catégorie) du jour affiché ; swipe tactile change le jour (`homeDayOffset`).
  - Liste "À faire bientôt" : checkbox, point couleur personne, titre, échéance, tag catégorie.

### 2. Calendrier
- **Purpose**: vue semaine/mois des rendez-vous et tâches datées, création/édition/suppression.
- **Layout**: toggle segmenté Semaine/Mois (top-right), libellé de période centré (swipe gauche/droite pour naviguer, pas de flèches), grille semaine (7 chips jour) ou grille mois (7×6 cellules), liste détaillée du jour sélectionné en dessous, bouton "+ Ajouter un rendez-vous".
- **Components**:
  - Chip jour (semaine) : 42px large, coins arrondis 14px, actif = fond `--color-accent-300`/texte `--color-accent-800`.
  - Cellule mois : ratio carré, coins arrondis 10px, un point par personne distincte ayant un événement ce jour (max plusieurs points alignés).
  - Ligne événement (liste détaillée) : point couleur, titre, heure + suffixe plage multi-jours + suffixe rappels, tag personne. Cliquable → ouvre en édition.
  - Modale "Nouveau/Modifier rendez-vous" (sheet bas d'écran, coins 24px haut) : titre, date début, date fin optionnelle (événement multi-jours), heure ou toggle "Toute la journée", chips personne (Moi/conjoint/Vous deux), chips rappels multi-sélection (Aucun/15min/1h/1j/2j/1sem), bouton Enregistrer, bouton Supprimer (si édition).

### 3. Tâches
- **Purpose**: liste des tâches/comptes récurrents par catégorie, complétion, preuve de paiement.
- **Layout**: filtres segmentés (Tout/Non terminées/Terminées) en haut, puis sections par catégorie (Entretien, Rénovation, Finances) avec liste de tâches.
- **Components**:
  - Ligne tâche : checkbox ronde (7px radius, cochée = fond `--color-accent-400`), avatar-badge cliquable (cercle 22px, initiale du prénom, couleur par personne — cliquer fait défiler l'assignation Moi→conjoint→Vous deux), titre (barré si complété), échéance ou "Fait par [nom] le [date]" si complété, tag catégorie, icône reçu (si preuve jointe) → ouvre visualiseur plein écran.
  - Complétion d'une tâche catégorie "Finances" → invite immédiate "Ajouter une preuve ?" avec bouton caméra (capture photo) ou "Plus tard".
  - Modale "Nouvelle/Modifier tâche" : titre, chips catégorie, chips personne, date/heure optionnelles, chips rappels multi-sélection, bouton Enregistrer/Supprimer.

### 4. Planification des repas (semaine)
- **Purpose**: assigner une recette par jour, suggestions IA, favoris visuels.
- **Layout**: libellé semaine centré (swipe gauche/droite pour changer de semaine), 7 lignes jour (photo+nom recette ou boutons "Choisir"/"IA suggère"), puis grille 2 colonnes de recettes favorites (photo 4:3 + nom + durée + tag).
- **Components**:
  - Ligne jour avec recette : miniature 52×52px cliquable → détail recette ; bouton × pour retirer. Drag-and-drop (ou swap au clic) entre jours pour réorganiser.
  - Sheet "Choisir une recette" : liste simple des favoris.
  - Sheet "Suggestions de l'IA" : champ recherche libre + 3 suggestions (photo, nom, durée/tag) cliquables pour assigner.
  - Modale détail recette : photo bandeau 16:9, nom, durée/tag, liste d'ingrédients avec bouton "+ Ajouter" par ingrédient (état "Ajouté ✓" si déjà dans la liste d'épicerie).

### 5. Liste d'épicerie
- **Purpose**: liste d'achats, alimentée manuellement ou depuis les recettes.
- **Layout**: champ ajout + bouton, compteur d'articles restants + lien "Effacer les articles cochés", liste d'articles.
- **Components**: ligne article (checkbox, nom barré si cochée, tag "Recette" si ajouté depuis une recette, bouton × suppression individuelle).

### 6. Paramètres (accessible depuis l'icône engrenage)
Sheet racine avec entrées : Mon compte, Membres de la famille, Notifications, Préférences de l'application, Importer.
- **Mon compte**: champs Nom (source de vérité du prénom affiché partout dans l'app) et Courriel, bouton Enregistrer, bouton Changer le mot de passe, bouton Se déconnecter.
- **Membres de la famille**: liste des 2 membres (avatar initiale + nom éditable inline), champ invitation par courriel + bouton Inviter, liste des invitations en attente avec annulation.
- **Notifications**: interrupteur maître, toggles par catégorie (Rendez-vous / Tâches / Rappels de repas), sélection du rappel par défaut (chips).
- **Préférences de l'application**: choix langue (FR/EN), format d'heure (24h/12h), premier jour de semaine (dimanche/lundi), toggle sons, **sélecteur de palette de couleurs** (4 pastilles bicolores : Printanier, Sauge, Lavande, Océan — change les tokens de couleur de toute l'app en direct).
- **Importer**: sous-sheet avec 2 options — "Calendrier" (import direct de fichier .ics → crée des événements calendrier avec dates de début/fin réelles, gère les événements journée entière avec DTEND exclusif) et "Calendrier de poubelle" (import .ics → ouvre une invite pour choisir un rappel Aucun/Standard/Silencieux + heure, puis crée des **tâches** d'un seul jour, catégorie Entretien).

## Interactions & Behavior
- **Swipe horizontal** (tactile, seuil 50px) pour naviguer : jour affiché à l'accueil, semaine/mois au calendrier, semaine de repas.
- **Cycle d'assignation** : cliquer l'avatar d'une tâche fait défiler Moi → conjoint → Vous deux.
- **Drag-and-drop** entre jours de repas (ou tap-to-swap) pour réorganiser la semaine.
- **Import .ics** : dépliage des lignes repliées (RFC 5545 line folding), découpage strict par bloc `VEVENT`...`END:VEVENT`, gestion de l'exclusivité du DTEND pour événements journée entière. Le calendrier "poubelle" ignore volontairement le DTEND du fichier source (fenêtres d'affichage multi-jours trompeuses) et force un seul jour.
- **Palette de couleurs** : changer de palette réécrit les CSS custom properties du thème en direct (pas de rechargement).
- **Preuve de transaction** : uniquement déclenché à la complétion d'une tâche de catégorie "Finances" ; stocke l'image (à remplacer par un vrai upload/stockage cloud en prod) ; visualiseur plein écran au clic sur l'icône reçu.
- Toutes les modales sont des sheets qui montent du bas, hauteur max 80% avec défilement interne, fond semi-transparent cliquable pour fermer.

## State Management
États principaux à modéliser côté app réelle (remplacer le state React local du prototype par une vraie source de données partagée famille) :
- `events[]`: {id, dayIndex/date, endDate, title, time, person, reminders[]}
- `tasks[]`: {id, category, title, due/date/time, person, completed, completedBy, completedDate, reminders[], receiptImage}
- `mealPlan`: map date ISO → recipeId
- `recipes[]`: {id, name, time, tag, ingredients[], image}
- `groceryList[]`: {id, name, checked, fromRecipe}
- Préférences utilisateur : nom/courriel des 2 membres, notifications par catégorie, rappel par défaut, langue, format heure, premier jour semaine, sons, palette de couleurs
- Invitations en attente (email)

**Important pour la vraie app** : les données (événements, tâches, repas, épicerie, préférences) doivent être **synchronisées en temps réel entre les comptes des deux membres du foyer** (backend partagé, pas de state local par appareil). Les notifications (rappels, imports poubelle) doivent déclencher de vraies notifications push natives à l'heure programmée.

## Design Tokens
Système "Organic" : fond crème, texte foncé, 2 couleurs d'accent avec rampes tonales 100-900, radius généreux (16px containers, pills pour boutons/chips), police display Caprasimo + corps Figtree.

4 palettes actives dans le prototype (voir constante `COLOR_PALETTES` dans le fichier source) :
- **Printanier** (défaut) : bg `#f9efe9`, texte `#232c47`, accent `#cf7669` (terracotta), accent-2 `#3f8fa0` (bleu-sarcelle)
- **Sauge** : bg `#fdf6ea`, accent `#e8836b` (corail), accent-2 `#8a9e78` (vert sauge)
- **Lavande** : bg `#f5eef9`, accent `#8b6bb0`, accent-2 `#d29a2e`
- **Océan** : bg `#eaf4f6`, accent `#3f8fa0`, accent-2 `#cf7669`

Chaque accent a une rampe complète 100→900 (voir `COLOR_PALETTES` pour les valeurs hex exactes de chaque étage).

Catégories de tâches (tags) : Entretien (`tag-accent-2`), Rénovation (`tag-outline`), Finances (`tag-neutral`).

## Assets
- Icône de l'app / favicon : image fournie par l'utilisateur (uploads, logo "G" avec feuilles et cœur) — à remplacer par l'asset de marque final en production.
- Photos de recettes/repas : emplacements `image-slot` (glisser-déposer) dans le prototype — en prod, vraies photos hébergées.

## Files
- `Gestion Familiale.dc.html` — prototype complet (template + logique), fichier de référence principal.
- `ios-frame.jsx`, `image-slot.js` — utilitaires du prototype, à ignorer pour l'implémentation finale.
