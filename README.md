# Migros Analytics Dashboard

Application Vue.js pour analyser vos données d'achat Migros avec un design professionnel noir et orange.

## 🚀 Démarrage rapide

### Installation

```bash
npm install
```

### Développement

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

### Build de production

```bash
npm run build
```

Les fichiers de production seront générés dans le dossier `dist/`

## 🎨 Fonctionnalités

- **Dashboard interactif** avec statistiques en temps réel
- **Drag & Drop** de fichiers CSV
- **Graphiques animés** avec Chart.js
- **Recherche et filtres** avancés
- **Design professionnel** noir et orange monochrome
- **Placeholders** avant chargement des données
- **Animations de chargement** pour une meilleure UX
- **Responsive** pour tous les écrans

## 📊 Onglets disponibles

1. **Vue d'ensemble** - Statistiques globales et dépenses mensuelles
2. **Tendances** - Analyse temporelle (jour, heure, évolution)
3. **Produits** - Top produits, recherche, liste complète
4. **Magasins** - Répartition et statistiques par magasin

## 📁 Format des fichiers CSV

Les fichiers CSV Migros doivent avoir le format suivant :

```
Datum;Zeit;Filiale;Kassennummer;Transaktionsnummer;Artikel;Menge;Aktion;Umsatz
21.10.2025;14:59:08;MM Cernier;256;50;MBud pain toast clair;1;0.00;1.35
```

## 🛠️ Technologies utilisées

- Vue 3 (Composition API)
- Chart.js 4
- Papaparse
- Vite
- CSS3 avec variables CSS

## 💡 Note

Toutes les données sont traitées localement dans votre navigateur. Aucune donnée n'est envoyée à un serveur externe.
