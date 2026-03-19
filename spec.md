# Farminder

## Current State
The app has a Fertilizer Schedule feature with a calendar view, add/delete schedules, and today's dashboard. The backend has `FertilizerSchedule` type and related endpoints. There is no spray schedule yet.

## Requested Changes (Diff)

### Add
- `SpraySchedule` type in backend (id, cropId, sprayName, scheduledDate, notes, isDone)
- Backend functions: `addSpraySchedule`, `getSpraySchedulesForMonth`, `getTodaysSpraySchedules`, `markSprayScheduleAsDone`
- SpraySchedulePage in frontend (same layout as SchedulePage but for spraying)
- Navigation link to spray schedule page
- Dashboard shows both fertilizer and spray tasks for today

### Modify
- Header/nav to include Spray Schedule link
- DashboardPage to show spray reminders alongside fertilizer reminders
- App routing to add `/spray-schedule` route

### Remove
- Nothing

## Implementation Plan
1. Update Motoko backend with SpraySchedule type and 4 new endpoints
2. Regenerate frontend bindings
3. Add spray schedule hooks in useQueries.ts
4. Create SpraySchedulePage.tsx mirroring SchedulePage.tsx
5. Update App.tsx routing and Header nav
6. Update DashboardPage to show today's spray schedules
