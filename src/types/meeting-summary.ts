/**
 * Structured meeting minutes returned by the meeting-summarizer edge function.
 * Mirror this shape in supabase/functions/meeting-summarizer/index.ts system prompt.
 */
export interface MeetingSummaryActionItem {
  task: string;
  owner: string | null;
  deadline: string | null;
}

export interface MeetingSummary {
  executive_summary: string;
  decisions: string[];
  action_items: MeetingSummaryActionItem[];
  attendance: string[];
  key_discussion_points: string[];
}
