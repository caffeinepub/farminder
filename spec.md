# Farminder

## Current State
The app has a `checkUserPermission` function in the backend that calls `AccessControl.hasPermission`, which in turn calls `getUserRole`. If a user is not registered in the access control state (e.g., after a canister upgrade clears non-stable state, or if `_initializeAccessControlWithSecret` didn't complete), `getUserRole` traps with "User is not registered". This causes all data operations (addCrop, addPlot, addFertilizerSchedule, etc.) to fail with an error caught on the frontend as "Failed to add crop/plot".

## Requested Changes (Diff)

### Add
- Auto-registration logic for authenticated (non-anonymous) users

### Modify
- `access-control.mo`: `getUserRole` should return `#user` for unregistered but authenticated (non-anonymous) principals instead of trapping — this makes any logged-in user able to use the app without needing explicit registration
- `main.mo`: `checkUserPermission` should reject anonymous callers directly, without relying on the access control registration state

### Remove
- Nothing

## Implementation Plan
1. Update `getUserRole` in `access-control.mo` to return `#user` for unregistered non-anonymous principals
2. Update `checkUserPermission` in `main.mo` to first reject anonymous callers, then delegate to permission check
