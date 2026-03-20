# Farminder

## Current State
Backend uses non-stable in-memory Maps for crops, fertilizer schedules, spray schedules, and user profiles. All counters (nextCropId, nextFertilizerScheduleId, nextSprayScheduleId) are also non-stable. This means every canister upgrade (every deployment) wipes all user data — the root cause of schedules disappearing.

## Requested Changes (Diff)

### Add
- Stable storage arrays for all data (crops, fertilizer schedules, spray schedules, user profiles, and ID counters)
- `preupgrade` system hook to serialize in-memory Maps to stable arrays
- `postupgrade` system hook to restore in-memory Maps from stable arrays on canister start

### Modify
- Convert `var nextCropId`, `var nextFertilizerScheduleId`, `var nextSprayScheduleId` to `stable var`
- Add stable backing vars for all four Maps

### Remove
- Nothing removed

## Implementation Plan
1. Add `stable var` arrays for each data store (crops, fertSchedules, spraySchedules, profiles) as `[(Principal, [T])]`
2. Add `stable var` for ID counters
3. Add `system func preupgrade()` that copies Maps → stable arrays
4. Add `system func postupgrade()` that restores Maps from stable arrays
