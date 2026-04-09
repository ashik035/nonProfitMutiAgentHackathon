

# Donor Acknowledgment Letter Generator

## What It Does
Adds a "Generate Acknowledgment Letter" button to the donor profile drawer on the Donor Pipeline page. Clicking it calls the Lovable AI Gateway to generate a personalized thank-you letter using the donor's data, then displays it in a polished letter preview with action buttons.

## How It Works

1. **Enrich donor data** — Expand the `Donor` interface and `INITIAL_DONORS` data with richer demo context per donor: email, fund designation, giving history array, contact notes, and volunteer/event flags. This gives the AI real material to personalize with.

2. **Add "Generate Acknowledgment Letter" button** to the profile drawer (`SheetContent`), below the giving history table.

3. **On click → call edge function** — A new edge function `generate-donor-letter/index.ts` takes donor context and calls the Lovable AI Gateway (`google/gemini-3-flash-preview`) with a system prompt instructing it to write a warm, personalized acknowledgment letter in the ED's voice. The prompt includes all donor details so the letter references specific gifts, funds, and personal touches.

4. **Letter preview UI** — After generation, the drawer expands to show the letter in a white card styled like a document (serif font, proper spacing, Brightside Foundation letterhead). Below the letter: four action buttons.

5. **Action buttons** (all local state, no backend):
   - **Copy to Clipboard** — copies letter text, toast confirmation
   - **Download as Word Doc** — generates a `.docx` file using the browser (simple Blob download as `.txt` formatted nicely, or we can use a lightweight approach)
   - **Attach to Donor Record** — toast "Attached to Jennifer Walsh's Salesforce record"
   - **Edit Before Sending** — switches letter to an editable textarea

## Files Changed

1. **`supabase/functions/generate-donor-letter/index.ts`** (new) — Edge function that takes donor context, calls Lovable AI Gateway, returns the letter text.

2. **`src/pages/DonorPipelinePage.tsx`** — Enrich donor data with fund/notes/history fields. Add letter generation state, the generate button in the profile drawer, the letter preview card, and the four action buttons.

## Donor-Specific Data for AI Context

Each donor gets enriched fields so the AI can personalize:
- Jennifer Walsh: Youth Programs fund, $1,950 total giving, interested in naming opportunity, attended Spring Gala
- Thomas Rivera: General Operating, $5,000 pledge, long-time supporter
- Margaret Liu: Technology Access fund, $2,500/yr, volunteer mentor
- etc.

## Demo Flow
Staff opens profile drawer → clicks "Generate Acknowledgment Letter" → 2-3s spinner → beautiful letter appears with the donor's name, gift amount, fund, and a personal touch → Copy/Download/Attach/Edit buttons all work instantly.

