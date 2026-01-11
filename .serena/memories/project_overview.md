# PLANORAI - Project Overview

## Branding
| Element | Value |
|---------|-------|
| **Name** | PLANORAI |
| **Tagline** | *AI-powered family planning* |
| **Etymology** | Plan + Aura + AI |
| **Primary** | Coral `#FF6B4A` |
| **Secondary** | Violet `#8B5CF6` |
| **Accent** | Amber `#F59E0B` |
| **Production** | https://planning-generator-steel.vercel.app |

## Purpose
AI-powered family planning generator with intelligent task distribution. French-language UI for shared household task management.

## Current Status
- **TypeScript Migration**: ✅ Complete (75 .ts/.tsx files)
  - Branch: `refactor/typescript-migration` pushed to origin
  - Linear: DEV-117 (Done)
  - 107 files changed, 3,777 additions, 1,469 deletions
- **E2E Testing**: ✅ Validated 2026-01-08 (13/13 tests pass)
- **Production Ready**: Yes
- **Visual Identity**: ✅ Complete (logo, favicon, OG image)
- **Linear Issue**: DEV-128 (Done)

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

## Visual Assets
- **Logo**: `src/components/ui/Logo.tsx` (PlanoraiLogo, PlanoraiIcon)
- **Favicon**: `public/favicon.svg` (calendar + sparkle)
- **OG Image**: `public/og-image.svg` (1200x630)
- **Animation**: Pulsing aura effect on logo

## Routes
- `/login`, `/register` - Auth
- `/history` - Planning list (default)
- `/planning/new` - New planning
- `/planning/:id` - Edit existing
- `/shared/:token` - Public read-only

## Database
JSONB storage in `plannings` table:
- `config`, `users_data`, `tasks_data`, `milestones_data`, `planning_result`
