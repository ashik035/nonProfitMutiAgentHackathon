# Feature: Grant Writer & Compliance Summary

> AI-assisted grant writing tool and compliance status viewer for active grants

**Status**: In Progress
**Module**: platform (nonprofit-ops group)
**Date**: 2026-05-06

## Overview

Two related AI features that help grant managers work more efficiently:

1. **Compliance Summary** — A modal on each active grant card that generates a structured AI summary of compliance status, utilization, deadlines, and required actions.

2. **Grant Writer** (`/grant-writer`) — A structured two-column drafting tool where staff select a grant + programs + writing section and generate a professional first draft using the organization's real program data.

Both features use the Lovable AI gateway (`ai.gateway.lovable.dev`) via Supabase Edge Functions, following the same pattern as `generate-donor-letter`.

## User Stories

- As a Development Director, I want to quickly see the compliance status for any active grant so I can act before deadlines pass.
- As a grant writer, I want to generate a professional first draft of grant writing sections using our real program data so I spend less time on blank-page work.

## UI Design

### Pages

| Route | Component | Description |
|-------|-----------|-------------|
| /grants | GrantsPage.tsx | Existing page — adds "Generate Compliance Summary" button + modal |
| /grant-writer | GrantWriterPage.tsx | New two-column grant writing tool |

### Compliance Summary Modal (Feature 1)

- Triggered by "Generate Compliance Summary" button on each active grant card
- Loading state: spinner + "Generating compliance summary…" text
- Output: structured markdown with sections for Status, Utilization, Deadlines, Required Actions
- Copy to clipboard button
- AI-generated disclaimer at bottom

### Grant Writer Page (Feature 2)

Left panel (1/3 width):
- Select Grant dropdown (active grants from nonprofitDemoData.ts DEMO_GRANTS)
- Select Programs checkboxes (from DEMO_PROGRAMS)
- Writing Section dropdown (Executive Summary, Program Narrative, Evaluation Plan, Budget Justification, Statement of Need)
- Generate Draft button (primary, full width)
- Note: "AI uses your program outcomes, budget data, and impact metrics"

Right panel (2/3 width):
- Placeholder: dashed border, PenTool icon, message
- Loading: skeleton with animated pulse
- Output: section title, prose draft, toolbar (Copy, Regenerate, Add to Grant Report), disclaimer

## API Design

### Edge Functions

#### generate-compliance-summary
- **Method**: POST
- **Auth**: None (public Supabase function)
- **Request Body**: `{ grant: { name, funder, amount, utilized, daysUntilDeadline, deadlineDate, status, nextMilestone } }`
- **Response**: `{ summary: string }` (markdown)

#### generate-grant-draft
- **Method**: POST
- **Request Body**: `{ grant, programs, section }`
- **Response**: `{ draft: string }` (prose paragraphs)
- **AI Config**: max_completion_tokens: 1200

## Feature Flags

None — available to all authenticated users as part of nonprofit-ops group.

## Navigation

Added to "Nonprofit Operations" nav group in `navigationStructure.ts`:
- Title: "Grant Writer"
- Route: `/grant-writer`
- Icon: `PenTool`

## Dependencies

- `nonprofitDemoData.ts` — DEMO_GRANTS and DEMO_PROGRAMS
- `supabase/functions/_shared/` — CORS headers pattern
- `LOVABLE_API_KEY` — Supabase secret (already configured)
