# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Planning Familial - A family planning generator web app with intelligent task distribution algorithms. French-language UI designed for shared household task management.

## Development Commands

```bash
bun run dev      # Start development server (Vite)
bun run build    # Production build
bun run lint     # ESLint check
bun run preview  # Preview production build
```

## Tech Stack

- React 19 + Vite 7
- Tailwind CSS v4 (using @tailwindcss/vite plugin)
- Motion (Framer Motion) for animations
- Supabase (Auth + PostgreSQL + Realtime)
- React Router v7

## Architecture

### Core Data Flow

1. **Configuration** (`usePlanningConfig`) → Users define work hours, users, tasks, milestones
2. **Algorithm** (`planningAlgorithm.js`) → Generates optimized schedule via grid-based placement
3. **Persistence** (`usePlannings`) → CRUD operations to Supabase with auto-save (30s interval)
4. **Realtime** (`useRealtimeSync`) → Multi-device sync via Supabase subscriptions

### Planning Algorithm (`src/utils/`)

The core algorithm uses a **grid-based placement system**:

- `gridUtils.js` - Creates time-slot grids with columns per user + "common" column
- `planningAlgorithm.js` - Places tasks in priority order:
  1. Daily recurring tasks
  2. Weekly recurring tasks
  3. One-time tasks
  4. Custom recurrence tasks
  5. Flexible tasks (fill remaining slots)

Key concepts:
- **Task types**: `solo` (single user), `common` (blocks all users), `flexible` (fills gaps)
- **Time preferences**: morning/afternoon/evening/any
- **Priority sorting**: urgent(1) → haute(2) → normale(3) → basse(4)

### Hooks Architecture (`src/hooks/`)

| Hook | Purpose |
|------|---------|
| `usePlanningConfig` | Form state for config/users/tasks with validation |
| `usePlanningGenerator` | Runs algorithm, tracks generation state |
| `usePlannings` | Supabase CRUD + sharing (token-based public links) |
| `useMilestones` | Goal tracking with focus feature |
| `useRealtimeSync` | Supabase realtime subscriptions |
| `useToasts` | Toast notification system |
| `useAIGenerator` | AI-powered planning generation via Claude API |
| `useShoppingList` | Shopping list management with categories |

### Database Schema

Uses JSONB storage in `plannings` table for flexibility:
- `config` - General settings
- `users_data` - Array of user profiles
- `tasks_data` - Array of tasks
- `milestones_data` - Array of milestones
- `planning_result` - Generated schedule

Full relational schema available in `supabase/schema.sql` (for reference/future migration).

### Component Organization

- `components/forms/` - Configuration forms (GeneralConfig, Users, Tasks)
- `components/planning/` - Schedule display (WeekView, DayColumn)
- `components/printable/` - Print layouts (magazine and colore styles)
- `components/dashboard/` - Stats and progress visualization
- `components/milestones/` - Goal management UI

### Routing

- `/login`, `/register` - Auth pages
- `/history` - Planning list (default)
- `/planning/new` - New planning
- `/planning/:id` - Edit existing
- `/shared/:token` - Public read-only view

## Environment Variables

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

## Code Conventions

- French language for UI strings and comments
- JSDoc typedefs in `src/types/index.js` for data structures
- Hooks export via barrel files (`index.js`)
- Animation imports from `motion/react` (not `framer-motion`)

## State Management Notes

### Planning Name

The planning name is managed by a **single source of truth**: `planningName` state in `PlanningEditorPage.tsx`.

- **Header input**: Editable field using `planningName`
- **Save operation**: Uses `planningName` for the `name` field in Supabase
- **GeneralConfigForm**: Does NOT include a name field (to avoid duplication)

> ⚠️ Never add a name field to `GeneralConfigForm` - it would create state desynchronization issues with the header.

## AI Planning Generator

### Overview

The app supports AI-powered planning generation via Claude API, allowing users to describe their planning needs in natural language and receive structured data.

### Architecture

```
Frontend (AIPromptModal)
    ↓ prompt
Supabase Edge Function (generate-planning)
    ↓ proxied request
Claude API (claude-sonnet-4)
    ↓ JSON response
aiGenerator.ts (transform)
    ↓ structured data
usePlanningConfig (bulk load)
```

### Key Files

| File | Purpose |
|------|---------|
| `supabase/functions/generate-planning/index.ts` | Edge Function proxy to Claude API |
| `src/services/aiGenerator.ts` | Client + data transformation |
| `src/hooks/useAIGenerator.ts` | React hook for generation state |
| `src/components/forms/AIPromptModal.tsx` | Modal UI for prompt input |
| `src/components/forms/AIPromptPreview.tsx` | Preview generated data before applying |

### Element Type Distinction

The AI distinguishes 4 types of elements:

| Type | Description | Example |
|------|-------------|---------|
| **Tasks** | Schedulable activities with duration | Ménage, cuisine, sport |
| **Shopping List** | Items to purchase (NOT tasks!) | lait, pain, fromage |
| **Milestones** | Long-term goals | "Maison bien rangée" |
| **Users** | People to schedule | Hugo, Delphine |

### Shopping List Categories

The AI uses these category slugs mapped to French names:

| Slug | Display Name | Icon |
|------|-------------|------|
| `fruits_legumes` | Fruits & Légumes | 🥬 |
| `viandes_poissons` | Viandes & Poissons | 🥩 |
| `produits_laitiers` | Produits Laitiers | 🧀 |
| `boulangerie` | Boulangerie | 🥖 |
| `epicerie` | Épicerie | 🥫 |
| `hygiene_maison` | Hygiène & Maison | 🧴 |
| `surgeles` | Surgelés | ❄️ |
| `boissons` | Boissons | 🍷 |

### Environment Variables

```env
ANTHROPIC_API_KEY=sk-ant-...  # Set in Supabase Secrets (never in frontend)
```

### Deployment

```bash
# Deploy Edge Function via Supabase MCP or CLI
supabase functions deploy generate-planning
```
