# Farminder

## Current State
The app has full crop and plot management. Crops can be edited via pencil icon (added in Version 19). Plots can be deleted but cannot be edited (only the plot name is stored as a field on the Crop). The backend has `updateCrop` which can update name, cropType, and plotName.

## Requested Changes (Diff)

### Add
- Edit plot functionality: pencil icon on each plot card in PlotsPage allowing the user to rename the plot (plotName field on crop)

### Modify
- PlotsPage: add edit button (pencil icon) to each plot card that opens a dialog to edit the plot name

### Remove
- Nothing

## Implementation Plan
1. In PlotsPage, add a pencil icon button on each plot card header alongside the existing delete button
2. Add an edit dialog/modal that lets the user update the plot name
3. On save, call `updateCrop` with the updated plotName (keeping cropId, name, cropType the same)
4. Refresh the crop list after update
