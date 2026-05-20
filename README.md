# Campus · Plateforme de projets étudiants

SPA React + Vite + Supabase pour gérer projets, équipes, tableau Kanban temps réel et livrables. Deux rôles : étudiant et encadrant.

## Stack

- **Front** : React 18, Vite 5, Tailwind CSS 3, Framer Motion
- **Data** : Supabase (Auth + PostgreSQL + Storage + Realtime), TanStack Query
- **État** : Zustand (auth)
- **Formulaires** : React Hook Form + Zod
- **Drag & drop** : `@hello-pangea/dnd`
- **Graphiques** : Recharts
- **Déploiement** : Netlify

## Démarrage rapide

```bash
npm install            # ou pnpm install
cp .env.example .env   # puis renseigner les valeurs Supabase
npm run dev
```

Variables `.env` requises :

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhb...
```

## Configuration Supabase

1. Dans **SQL Editor**, exécuter dans l'ordre :
   - `supabase/migrations/0001_init.sql` — schéma, RLS, trigger d'inscription
   - `supabase/migrations/0002_storage.sql` — bucket `deliverables` + policies
2. (Optionnel) Créer un bucket `avatars` (public) pour l'upload d'avatar profil.
3. Activer le Realtime sur les tables `tasks` et `deliverables` (déjà fait par la migration via `alter publication`).

## Scripts

```
npm run dev        # serveur de dev
npm run build      # build production -> dist/
npm run preview    # preview du build
npm run lint       # ESLint, max-warnings 0
```

## Architecture (≈ 25 fichiers JSX)

```
src/
  lib/           supabase.js, utils.js
  store/         authStore.js
  router/        index.jsx (ProtectedRoute, RoleGuard)
  hooks/         useProjectsData.js
  components/
    ui/          Button, Card, Badge, Input, Modal, Skeleton, Avatar, Toast, Empty
    layout/      AppLayout, Navbar, Sidebar, PageHeader
    projects/    ProjectCard, ProjectForm, MembersPanel
    tasks/       KanbanBoard, TaskForm
    deliverables/ UploadZone, DeliverableList
  pages/
    auth/        Login, Register, AuthShell
    dashboard/   StudentDashboard, SupervisorDashboard
    projects/    ProjectList, ProjectCreate, ProjectDetail
    profile/     Profile
    NotFound.jsx
```

## Sécurité

- **RLS activé** sur toutes les tables ; les politiques restreignent l'accès aux membres du projet ou au superviseur (cf. `0001_init.sql`).
- **Storage policies** restrictives : seul un membre du projet peut lire un livrable, seul le déposant ou le superviseur peut supprimer.
- **Trigger `handle_new_user`** crée automatiquement le profil à l'inscription en `SECURITY DEFINER` avec `search_path` fixé.
- **Headers de sécurité** côté Netlify : `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`.
- **Pas de secret côté client** : seule la clé `anon` est exposée ; toute opération sensible passe par RLS.

## Déploiement Netlify

1. Connecter le repo GitHub à Netlify.
2. Ajouter `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` dans **Site settings → Environment variables**.
3. Chaque push sur `main` déclenche un build et un déploiement.

Le `netlify.toml` configure le SPA fallback (`/* → /index.html`) et les headers.

## Rôles

| Route | Étudiant | Encadrant |
|-------|----------|-----------|
| `/dashboard` | Mes projets + tâches du jour | Métriques globales + tableau projets |
| `/projects`  | — (redirigé) | Liste filtrable de tous ses projets |
| `/projects/new` | — | Créer un projet |
| `/projects/:id` | Lecture + tâches assignées | Lecture + édition complète |
| `/profile`   | Édition profil + avatar | Édition profil + avatar |

## Discipline de code

Le projet suit les règles du plan technique : YAGNI, pas de composant inutile, pas de dépendance superflue, ESLint `--max-warnings 0`. Voir `PLAN_P_1.md` (section 12) pour le détail.
