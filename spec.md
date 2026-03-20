# Farminder

## Current State
CropsPage allows adding and deleting crops. No edit functionality exists for crops.

## Requested Changes (Diff)

### Add
- `updateCrop(cropId, name, cropType, plotName)` backend function
- `useUpdateCrop` hook in useQueries.ts
- Edit button (pencil icon) on each crop card in CropsPage
- Edit dialog/modal to change crop name, type, and plot name

### Modify
- CropsPage.tsx: add edit state, edit dialog, pencil icon button next to trash icon
- useQueries.ts: add useUpdateCrop mutation
- main.mo: add updateCrop function

### Remove
- Nothing

## Implementation Plan
1. Add updateCrop to main.mo
2. Add useUpdateCrop hook to useQueries.ts
3. Update CropsPage.tsx with edit dialog and pencil icon
