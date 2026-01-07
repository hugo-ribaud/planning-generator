# Planning Familial

Application web de gestion et generation de plannings familiaux avec algorithme intelligent de repartition des taches.

## Fonctionnalites

- **Authentification** - Inscription/connexion par email avec Supabase Auth
- **Gestion des utilisateurs** - Ajout de membres avec disponibilites et preferences
- **Gestion des taches** - Creation de taches avec duree, priorite et contraintes
- **Jalons** - Definition de jalons (repas, activites) avec contraintes horaires
- **Generation intelligente** - Algorithme de repartition equitable des taches
- **Historique** - Sauvegarde et chargement des plannings precedents
- **Partage** - Liens de partage en lecture seule
- **Auto-sauvegarde** - Sauvegarde automatique toutes les 30 secondes
- **Export** - Version imprimable du planning

## Stack Technique

- **Frontend**: React 19 + Vite 7
- **Styling**: Tailwind CSS v4
- **Animations**: Motion (Framer Motion)
- **Backend**: Supabase (Auth, Database, RLS)
- **Routing**: React Router v7

## Installation

```bash
# Cloner le projet
git clone <url-du-repo>
cd planning-generator

# Installer les dependances
bun install

# Configurer les variables d'environnement
cp .env.example .env
# Editer .env avec vos credentials Supabase

# Lancer le serveur de developpement
bun run dev
```

## Variables d'environnement

Creer un fichier `.env` a la racine :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-cle-anon
```

## Structure du projet

```
src/
├── components/
│   ├── auth/           # Composants d'authentification
│   ├── config/         # Configuration du planning
│   ├── milestones/     # Gestion des jalons
│   ├── planning/       # Affichage du planning
│   ├── tasks/          # Gestion des taches
│   ├── ui/             # Composants UI reutilisables
│   └── users/          # Gestion des utilisateurs
├── contexts/
│   └── AuthContext.jsx # Contexte d'authentification
├── hooks/              # Hooks personnalises
├── lib/
│   └── supabase.js     # Client Supabase
├── pages/              # Pages de l'application
└── utils/              # Utilitaires et algorithmes
```

## Base de donnees

### Tables principales

- **user_accounts** - Comptes utilisateurs (auth)
- **plannings** - Plannings sauvegardes (JSONB)
- **profiles** - Profils des membres du planning

### Securite

- Row Level Security (RLS) active sur toutes les tables
- Chaque utilisateur ne voit que ses propres donnees
- Partage en lecture seule via tokens uniques

## Scripts

```bash
bun run dev      # Serveur de developpement
bun run build    # Build de production
bun run preview  # Preview du build
bun run lint     # Linter ESLint
```

## Licence

MIT
