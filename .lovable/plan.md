

# Diagnosis: Browse Agents & Donor Pipeline Visibility

## Finding

The code is **correctly wired** — both pages and sidebar items exist:
- `/agents` route → `AgentsBrowse` component (line 105 in routes)
- `/donor-pipeline` route → `DonorPipelinePage` (line 93 in routes)
- Both items in `navigationStructure.ts` under `nonprofit-ops` group (lines 79-80)

The session replay confirms the agents page IS rendering with the activity banner cycling.

## Likely Cause

**Stale localStorage** — the sidebar stores expanded/collapsed state in `localStorage` under a key. If the `nonprofit-ops` group was collapsed in a previous session, it stays collapsed and the items are hidden from view. The user needs to click the "Nonprofit Operations" group header to expand it.

Alternatively, the preview may need a hard refresh (Ctrl+Shift+R).

## Fix (small)

To make this more robust, I'll:

1. **Force the `nonprofit-ops` group to re-expand** when new items are added — clear the stale localStorage key on load if it doesn't contain the expected items
2. **Or simpler**: Make `nonprofit-ops` items render as **flat top-level links** (no collapsible group wrapper) since it's the only visible group for regular users — this removes the "hidden because collapsed" problem entirely

### Recommended: Flatten nonprofit-ops for regular users

- In `AppSidebar.tsx`, if only one group is visible (which is the case for all non-admin roles), render its items as flat sidebar links without a collapsible group header
- This ensures Donor Pipeline, Browse Agents, and all other items are always visible
- Admin users who see multiple groups still get the collapsible behavior

### Files Changed
1. `src/components/layout/AppSidebar.tsx` — Add logic to render single-group items flat (no collapsible wrapper)

