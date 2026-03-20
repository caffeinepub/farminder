# Farminder

## Current State
Calendar page fetches all fertilizer and spray schedules. When clicking a date in the month view, it shows tasks but only displays the crop name — no plot name is shown. The detail panel is conditionally rendered only when tasks exist on the selected day, but shows "No tasks" when there are none.

## Requested Changes (Diff)

### Add
- Plot name displayed alongside crop name in the day detail panel for each fertilizer/spray task
- Plot-wise grouping in the day detail popup: group tasks by plot name so user can see which plot had which fertilizer or spray

### Modify
- Day detail panel: add plot name info to each task row (or group by plot)
- Ensure the calendar shows dots for past dates as well as future (no filtering by current date — already done, just confirm)
- cropMap should also store plotName: create plotNameMap from cropId -> plotName

### Remove
- Nothing removed

## Implementation Plan
1. Build `plotNameMap` (cropId -> plotName) from crops data alongside existing `cropMap`
2. In the day detail panel, for each fertilizer/spray task row, show plot name as a subtitle below crop name
3. Optionally group tasks by plot name for clearer plot-wise view
