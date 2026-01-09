# Shopping List Printable Feature

## Overview
Integration of shopping list display in magazine-style printable planning.
Implemented: January 2026 (DEV-118, PR #6)

## Components

### PrintableShoppingList.tsx
- **Location**: `src/components/printable/magazine/`
- **Purpose**: Render shopping list for print
- **Props**:
  - `shoppingList: ShoppingList` - Data from planning
  - `maxCategories?: number` - Limit display (default 8, print uses 4)

### Layout
- 2-column grid for categories
- Max 5 items visible per category
- Overflow indicator for more items ("+ X autres...")
- Progress counter (checked/total) per category and global
- Empty state with shopping cart emoji

## Integration
- Imported in `PrintablePlanning.tsx`
- Rendered in Page 1 sidebar (col-span-5)
- Position: After QuickNotes component
- Conditional: only shows if categories have items

## Styling
- Emerald green accent color (`emerald-50`, `emerald-600`)
- Compact 11px text for items
- 3x3px checkbox indicators
- Print-optimized spacing
- Rounded corners and borders
- Category icons display

## Data Flow
```
PlanningEditorPage (shoppingList state)
  → PrintablePlanning (shoppingList prop)
    → PrintableShoppingList (renders categories + items)
```

## Related Files
- `src/components/printable/magazine/PrintableShoppingList.tsx` (NEW)
- `src/components/printable/magazine/PrintablePlanning.tsx` (MODIFIED)
- `src/components/printable/magazine/index.ts` (MODIFIED)
- `src/pages/PlanningEditorPage.tsx` (MODIFIED)

## Testing
- E2E validated: Add items → Generate planning → Printable view → Verify display
- Checked/unchecked items styling works correctly
- Category progress counters accurate
