# 🎪 Salon d'Affaires - Frontend React

Application React avec Material-UI, React Hook Form et Supabase pour la gestion des salons d'affaires.

## 🚀 Démarrage rapide

### 1. **Installation des dépendances**
```bash
npm install
```

### 2. **Configuration Supabase**

1. Créez un projet sur [Supabase](https://supabase.com)
2. Créez un fichier `.env` dans le dossier `app/` :

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

3. Exécutez le script SQL dans l'éditeur Supabase (fichier `supabase-schema.sql`)

### 3. **Démarrer l'application**
```bash
npm run dev
```

L'application sera accessible sur http://localhost:5173

## 🎯 Fonctionnalités actuelles

### ✅ **Authentification complète**
- **Inscription** avec validation (Zod + RHF)
- **Connexion** avec gestion des erreurs
- **3 rôles** : Organisateur, Visiteur, Sponsor
- **Session persistante** avec Supabase Auth
- **Interface moderne** avec Material-UI

### ✅ **Gestion des utilisateurs**
- **Profils automatiques** créés à l'inscription
- **Tableau de bord** personnalisé selon le rôle
- **Déconnexion** sécurisée

## 👥 Rôles utilisateurs

### 🎯 **Organisateur** (`organizer`)
- Admin complet
- Peut voir tous les utilisateurs
- Gérera les conférences (à venir)

### 👤 **Visiteur** (`visitor`)
- Utilisateur standard
- Pourra planifier son programme (à venir)

### 🏢 **Sponsor** (`sponsor`)
- Gérera les conférences sponsorisées (à venir)

## 🔧 **Technologies utilisées**

- **React 19** + **TypeScript**
- **Material-UI** (interface moderne)
- **React Hook Form** + **Zod** (formulaires + validation)
- **Supabase** (auth native + base de données)
- **Vite** (build tool rapide)

## 📱 **Test de l'application**

### **Créer un compte organisateur :**
1. Aller sur http://localhost:5173
2. Cliquer sur "S'inscrire"
3. Remplir le formulaire avec le rôle "Organisateur"
4. Se connecter après inscription

### **Créer un compte visiteur :**
- Même processus avec le rôle "Visiteur"

## 🚧 **Prochaines fonctionnalités**

### 📅 **Gestion des conférences** (prochaine étape)
- CRUD conférences pour les organisateurs
- **10 salles** x **3 jours** x **10 conférences/jour**
- Gestion des **conférenciers** (nom, photo, bio)
- **Filtres** par salle, date, conférencier

### 📋 **Planning personnel**
- Les visiteurs pourront ajouter des conférences à leur programme
- Éviter les conflits d'horaires
- Export du planning

### 📊 **Dashboard organisateur**
- **Statistiques** de participation
- **Taux de remplissage** des salles
- **Gestion des utilisateurs**

## 🗃️ **Base de données**

### **Scripts SQL disponibles**

1. **`supabase-schema.sql`** - Schéma minimal pour l'authentification
2. **`cleanup-database.sql`** - Script de nettoyage pour supprimer les anciennes tables du backend
3. **`disable-trigger.sql`** - Désactive le trigger automatique (plus simple)
4. **`fix-rls-policies.sql`** - Corrige les politiques RLS pour l'inscription

### **Pour nettoyer ta base Supabase** :

1. Va dans ton dashboard Supabase → SQL Editor
2. Colle le contenu de `cleanup-database.sql`
3. Exécute le script pour supprimer :
   - L'ancienne table `users`
   - La vue `users_stats`
   - Les triggers et fonctions obsolètes
4. Puis exécute `supabase-schema.sql` si ce n'est pas déjà fait

### **Si tu as des erreurs d'inscription** :

#### **Erreur "Database error saving new user"** :
1. Va dans ton dashboard Supabase → SQL Editor
2. Colle le contenu de `disable-trigger.sql`
3. Exécute le script

#### **Erreur "row-level security policy"** :
1. Va dans ton dashboard Supabase → SQL Editor  
2. Colle le contenu de `fix-rls-policies.sql`
3. Exécute le script pour créer une fonction sécurisée

⚠️ **ATTENTION** : Ce script supprime définitivement les données de l'ancien backend !

## 🏗️ **Architecture**

```
app/
├── src/
│   ├── components/
│   │   └── auth/           # Composants d'authentification
│   ├── contexts/
│   │   └── AuthContext.tsx # Gestion de l'état d'auth
│   ├── pages/
│   │   ├── AuthPage.tsx    # Page login/register
│   │   └── Dashboard.tsx   # Tableau de bord
│   ├── lib/
│   │   └── supabase.ts     # Configuration Supabase
│   └── App.tsx             # App principale
├── supabase-schema.sql     # Schéma de base de données
├── cleanup-database.sql    # Script de nettoyage
└── package.json
```

## 🔐 **Sécurité**

- **RLS (Row Level Security)** au niveau Supabase
- **Validation côté client** avec Zod
- **Tokens sécurisés** gérés par Supabase
- **HTTPS** en production

## 🎨 **Design System**

- **Material Design** avec personnalisation
- **Responsive** mobile-first
- **Thème cohérent** avec les couleurs du salon
- **UX fluide** avec loading states

La base d'authentification est **solide et prête** ! 🎉

Prochaine étape : **Gestion des conférences** 📅
