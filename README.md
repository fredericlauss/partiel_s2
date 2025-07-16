# Salon d'Affaires - Application de Gestion de Conférences

Application web permettant aux visiteurs de planifier leur participation aux conférences lors d'un salon d'affaires de 3 jours.

## Démarrage Rapide

### 1. Cloner le repository
```bash
git clone [URL_DU_REPO]
```

### 2. Naviguer vers l'application
```bash
cd partiel_s2
cd app
```

### 3. Configuration environnement
Créer un fichier `.env` dans le dossier `app/` avec les clés Supabase :

```env
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

> **Les clés sont fournies dans le cahier des charges ou sur le chat du rendu**

### 4. Lancement de l'application

#### Option A - Développement local
```bash
npm install
npm run dev
```
➡️ Accès : http://localhost:5173

#### Option B - Docker (depuis la racine)
```bash
docker compose up
```
➡️ Accès : http://localhost:8080

## Utilisation

### Comptes de test
- **Organisateur** : admin@salon.com / #motdepasse!123
- **Visiteur** : visiteur@salon.com / #motdepasse!123  
