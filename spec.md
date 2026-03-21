# Farminder

## Current State
The backend includes the `authorization` component (MixinAuthorization) which may be interfering with basic CRUD operations like addCrop. Users report being unable to add crops despite the function only checking for anonymous callers. The authorization mixin may introduce side effects that block logged-in users.

## Requested Changes (Diff)

### Add
- Nothing new

### Modify
- Remove authorization component from backend; replace with simple anonymous caller check built into the actor
- Keep all existing crop, fertilizer schedule, and spray schedule functionality intact
- Keep stable storage and pre/postupgrade for data persistence

### Remove
- authorization component dependency (MixinAuthorization, AccessControl imports)
- Authorization-related backend methods (assignCallerUserRole, getCallerUserRole, isCallerAdmin)

## Implementation Plan
1. Rewrite main.mo without authorization imports, keeping all crop/schedule CRUD, stable storage, pre/postupgrade
2. Update backend.d.ts to remove authorization-related types and methods
