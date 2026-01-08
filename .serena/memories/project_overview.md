# Planning Familial - Project Overview

## Purpose
Family planning generator web app with intelligent task distribution algorithms. French-language UI for shared household task management.

## Current Status
- **TypeScript Migration**: ✅ Complete (75 .ts/.tsx files)
- **E2E Testing**: ✅ Validated 2026-01-08 (13/13 tests pass)
- **Production Ready**: Yes

## Tech Stack
- **Frontend**: React 19 + Vite 7
- **Styling**: Tailwind CSS v4 (@tailwindcss/vite plugin)
- **Animations**: Motion (Framer Motion) - import from `motion/react`
- **Backend**: Supabase (Auth + PostgreSQL + Realtime)
- **Routing**: React Router v7
- **Runtime**: Bun

## Architecture
### Core Data Flow
1. Configuration (`usePlanningConfig`) → Users define work hours, users, tasks, milestones
2. Algorithm (`planningAlgorithm.js`) → Grid-based placement optimization
3. Persistence (`usePlannings`) → Supabase CRUD with auto-save (30s)
4. Realtime (`useRealtimeSync`) → Multi-device sync

### Key Concepts
- **Task types**: `solo`, `common`, `flexible`
- **Time preferences**: morning/afternoon/evening/any
- **Priority**: urgent(1) → haute(2) → normale(3) → basse(4)

## Routes
- `/login`, `/register` - Auth
- `/history` - Planning list (default)
- `/planning/new` - New planning
- `/planning/:id` - Edit existing
- `/shared/:token` - Public read-only

## Database
JSONB storage in `plannings` table:
- `config`, `users_data`, `tasks_data`, `milestones_data`, `planning_result`
