# Farminder

## Current State
All crops, plots, fertilizer and spray schedules are stored per-user principal. Each farmer owns their own data and no cross-user collaboration exists. A public share link allows read-only viewing.

## Requested Changes (Diff)

### Add
- Shared Plot concept: any logged-in farmer can create a shared plot that multiple farmers can collaborate on
- Backend data structures: `SharedPlot` (id, name, cropName, ownerPrincipal, collaborators list), `SharedFertilizerSchedule`, `SharedSpraySchedule` (same fields as existing but linked to sharedPlotId and include addedByPrincipal)
- Backend functions:
  - `createSharedPlot(cropName, plotName)` -- owner creates it, returns sharedPlotId
  - `inviteCollaborator(sharedPlotId, collaboratorPrincipal)` -- owner invites farmer by principal
  - `removeCollaborator(sharedPlotId, collaboratorPrincipal)` -- owner removes collaborator
  - `getMySharedPlots()` -- returns plots the caller owns or is a collaborator on
  - `addSharedFertilizerSchedule(sharedPlotId, fertilizerName, scheduledDate, quantity, notes)` -- any collaborator can add
  - `addSharedSpraySchedule(sharedPlotId, sprayName, scheduledDate, quantity, notes)` -- any collaborator can add
  - `getSharedPlotSchedules(sharedPlotId)` -- returns all fertilizer and spray schedules for the shared plot
  - `deleteSharedFertilizerSchedule(scheduleId)` -- only owner or the adder can delete
  - `deleteSharedSpraySchedule(scheduleId)` -- only owner or the adder can delete
- Frontend: new "Collaborate" tab/section in the Plots page showing shared plots separately from personal plots. Owner can invite farmers by entering their principal ID. Shows who added each schedule entry.

### Modify
- Plots page: add a "Shared Plots" section below personal plots with ability to create shared plots and manage collaborators

### Remove
- Nothing removed

## Implementation Plan
1. Add SharedPlot, SharedFertilizerSchedule, SharedSpraySchedule types to Motoko
2. Add stable storage variables for shared data
3. Implement all shared plot backend functions with access checks
4. Regenerate backend bindings
5. Frontend: add Shared Plots section to Plots page with invite UI and collaborative schedule view
