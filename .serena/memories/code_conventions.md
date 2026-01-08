# Code Conventions

## Language
- **UI strings**: French language
- **Comments**: French language
- **Code/variables**: English

## File Structure
- Hooks export via barrel files (`index.js`)
- JSDoc typedefs in `src/types/index.js`
- Components organized by domain (forms/, planning/, dashboard/, etc.)

## Imports
- Animation: `from 'motion/react'` (NOT `framer-motion`)
- Supabase: `from '@/lib/supabase'`

## Naming
- Components: PascalCase (`TasksForm.jsx`)
- Hooks: camelCase with `use` prefix (`usePlanningConfig.js`)
- Utils: camelCase (`planningAlgorithm.js`)

## Component Organization
```
src/components/
├── ui/         # Reusable UI components
├── forms/      # Configuration forms
├── planning/   # Schedule display
├── printable/  # Print layouts (magazine, colore)
├── dashboard/  # Stats visualization
└── milestones/ # Goal management
```
