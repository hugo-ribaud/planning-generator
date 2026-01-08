# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

**Planning Familial** is a family task scheduling application with intelligent task distribution algorithm. The app helps families organize tasks with availability tracking, priority management, and automated fair distribution.

### Stack
- **Frontend**: React 19 + Vite 7
- **Package Manager**: Bun (preferred)
- **Styling**: Tailwind CSS v4
- **Animations**: Motion (Framer Motion fork)
- **Backend**: Supabase (Auth + PostgreSQL with RLS)
- **Routing**: React Router v7

## Development Commands

```bash
# Install dependencies
bun install

# Development server (default: http://localhost:5173)
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview

# Lint code
bun run lint
```

## Environment Setup

1. Copy `.env.local.example` to `.env.local`
2. Add Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
3. Apply database schema from `supabase/schema.sql`

## Architecture

### Core Algorithm: Planning Generator
The heart of the application is `src/utils/planningAlgorithm.js`, which implements a multi-phase task placement algorithm:

1. **Phase 1**: Place daily recurring tasks (one per day)
2. **Phase 2**: Place weekly recurring tasks (considering preferred days)
3. **Phase 3**: Place one-time tasks
4. **Phase 4**: Place custom recurrence tasks
5. **Phase 5**: Fill remaining slots with flexible tasks

The algorithm prioritizes tasks by:
- Priority level (1=urgent → 4=low)
- Task type (common tasks before others)
- Duration (longer tasks placed first)

**Key utilities:**
- `gridUtils.js`: Grid creation, slot finding, task placement
- `timeUtils.js`: Time calculations and slot management
- `dateUtils.js`: Date formatting and week calculations

### Authentication Flow
- Managed by `AuthContext.jsx` using Supabase Auth
- `ProtectedRoute` component wraps authenticated pages
- User profiles auto-created on signup via database trigger
- All authenticated routes redirect to `/history` if not logged in

### Data Layer: Supabase

**Main Tables:**
- `profiles`: User profiles (extends auth.users)
- `planning_config`: Planning configurations
- `tasks`: Task definitions with recurrence/priority
- `milestones`: Goal tracking with progress
- `planning_slots`: Generated time slots assigned to users

**Security:**
- Row Level Security (RLS) enabled on all tables
- Authenticated users have full CRUD access to their data
- Real-time subscriptions enabled for collaborative editing

### State Management Patterns

**Custom hooks** in `src/hooks/`:
- `usePlannings.js`: CRUD operations for saved plannings
- `usePlanningGenerator.js`: Planning generation logic wrapper
- `useMilestones.js`: Milestone management
- `usePlanningConfig.js`: Configuration state
- `useRealtimeSync.js`: Real-time Supabase subscriptions
- `useToasts.js`: Toast notification system

**No global state library** - relies on React Context (AuthContext) and local component state.

### Page Structure

1. **PlanningHistoryPage** (`/history`): Dashboard showing saved plannings, statistics
2. **PlanningEditorPage** (`/planning/:id` or `/planning/new`): Main planning creation/editing interface
3. **SharedPlanningPage** (`/shared/:token`): Read-only public view (not yet fully implemented)
4. **LoginPage/RegisterPage**: Authentication

### Component Organization

```
components/
├── auth/          - Authentication guards (ProtectedRoute)
├── dashboard/     - History page stats and cards
├── forms/         - Multi-step forms for config/users/tasks
├── milestones/    - Milestone management UI
├── planning/      - Planning grid display and interaction
├── printable/     - Export templates (colore, magazine styles)
└── ui/            - Reusable primitives (Button, Card, Input, Select, Toast)
```

## Key Behaviors

### Auto-save
Plannings auto-save every 30 seconds when modified (handled in PlanningEditorPage).

### Data Structure
Plannings are stored as JSONB in Supabase with these fields:
- `config`: General settings (period, dates, work hours)
- `users_data`: Array of users with availability
- `tasks_data`: Array of tasks to schedule
- `milestones_data`: Array of goals/milestones
- `planning_result`: Generated schedule output

### Task Types
- **Solo**: Assigned to specific user
- **Common**: Shared, rotated among users
- **Flexible**: Fills remaining time slots

### Recurrence Types
- **Daily**: Repeats every day
- **Weekly**: Once per week
- **Once**: Single occurrence
- **Custom**: User-defined days

## Database Conventions

- All tables have `created_at` and `updated_at` timestamps
- Updates trigger automatic `updated_at` modification
- Foreign keys cascade on delete where appropriate
- UUIDs used for all primary keys
- Database enums defined for constrained fields (task_type, recurrence_type, etc.)

## Code Style

- **ESLint** configured with React hooks and React Refresh plugins
- ES2020+ features, ESM modules
- Unused vars allowed if they match `^[A-Z_]` pattern (constants)
- Functional components with hooks (no class components)
- Comments in French to match project language

## Important Notes

- **No test suite** currently exists - tests should be created following React Testing Library conventions
- The app is in **French** - all UI text, comments, and data is in French
- The database schema uses **snake_case** while JavaScript uses **camelCase** - hooks handle mapping
- Supabase ANON key is safe for client-side use (protected by RLS)
- The planning algorithm can fail to place some tasks if constraints are too strict - check `stats.failed` array

## Common Development Patterns

When adding new features:

1. **New data types**: Add to `supabase/schema.sql`, update RLS policies, create custom hook in `src/hooks/`
2. **New pages**: Create in `src/pages/`, add route to `App.jsx`, wrap with `ProtectedRoute` if auth required
3. **New forms**: Use existing UI components from `src/components/ui/`, follow multi-step pattern from existing forms
4. **Algorithm changes**: Modify `planningAlgorithm.js` and supporting utils, test with `testData.js`

## Troubleshooting

- **"Not authenticated" errors**: Check `.env.local` has correct Supabase keys, verify RLS policies
- **Planning generation failures**: Check console for algorithm errors, validate input data constraints
- **Real-time sync not working**: Ensure Supabase realtime is enabled for tables in dashboard
- **Build errors**: Clear Vite cache (`rm -rf node_modules/.vite`), reinstall dependencies
