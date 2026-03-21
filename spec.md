# Farminder

## Current State
Farminder has Dashboard, My Crops, Plots, and Calendar sections. Fertilizer and spray schedules are stored in the backend with name, date, cropId, and notes fields.

## Requested Changes (Diff)

### Add
- New "Materials" page at `/materials` showing current month's fertilizer and spray schedules in a 3-column card grid
- Each card displays: material name (fertilizer/spray), date, plot name, quantity (from notes), and type badge (Fertilizer/Spray)
- Cards sorted by date
- Month navigation to view other months
- Navigation link in Header
- Route in App.tsx

### Modify
- Header: add Materials nav link
- App.tsx: add materialsRoute

### Remove
- Nothing

## Implementation Plan
1. Create `MaterialsPage.tsx` fetching current month fertilizer + spray schedules, joining with crops for plot name, displaying in 3-column responsive grid sorted by date
2. Add route `/materials` in App.tsx
3. Add Materials nav link in Header.tsx
