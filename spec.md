# Farminder

## Current State
The app has Dashboard, My Crops, and Plots sections. The backend has `getAllFertilizerSchedules` and `getAllSpraySchedules` APIs. The frontend has matching hooks (`useGetAllFertilizerSchedules`, `useGetAllSpraySchedules`) but no Calendar page yet.

## Requested Changes (Diff)

### Add
- A new Calendar page (`/calendar`) that displays upcoming fertilizer and spray tasks in a monthly calendar view
- Calendar navigation to switch between months
- Each day cell shows colored dots/badges for fertilizer (green) and spray (blue) tasks
- Clicking a day shows a detail list of tasks for that day
- "Calendar" link added to the header navigation
- CalendarRoute added to App.tsx router

### Modify
- Header NAV_LINKS: add Calendar entry with CalendarDays icon
- App.tsx: add calendarRoute

### Remove
- Nothing

## Implementation Plan
1. Create `src/frontend/src/pages/CalendarPage.tsx` using `useGetAllFertilizerSchedules` and `useGetAllSpraySchedules` hooks
2. Calendar renders a monthly grid; each day with tasks shows colored indicators
3. Clicking a day opens a detail panel listing tasks for that day
4. Add month prev/next navigation
5. Add `/calendar` route in App.tsx
6. Add Calendar nav link in Header.tsx
