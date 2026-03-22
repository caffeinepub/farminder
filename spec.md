# Farminder

## Current State
The Motoko backend has shared plot collaboration functions (createSharedPlot, inviteCollaborator, removeCollaborator, getMySharedPlots, addSharedFertilizerSchedule, deleteSharedFertilizerSchedule, addSharedSpraySchedule, deleteSharedSpraySchedule, getSharedPlotSchedules) but these are missing from backend.d.ts. The frontend uses `(actor as any)` casts to call them, but the actual canister actor does not expose these methods, causing "failed to create shared plot" errors.

## Requested Changes (Diff)

### Add
- Regenerate backend with full shared plot collaboration API properly typed and exposed

### Modify
- backend.d.ts must include all SharedPlot types and all collaboration methods

### Remove
- Nothing

## Implementation Plan
1. Regenerate Motoko code including all existing features plus shared plot collaboration
2. Frontend hooks already exist -- just needs working bindings
