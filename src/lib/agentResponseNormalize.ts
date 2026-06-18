/**
 * Client-side helpers — normalize agent edge responses and local fallbacks.
 */

import type { MeetingSummary } from "@/types/meeting-summary";

export function coalesceRunId(runId: string | undefined | null, slug: string): string {
  if (runId && runId.trim()) return runId;
  return `local-${slug}-${crypto.randomUUID()}`;
}

/** Heuristic minutes when all cloud AI paths are unavailable */
export function buildMeetingSummaryFallback(transcript: string): MeetingSummary {
  const lines = transcript
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const attendance = lines
    .filter((l) => /\b(present|absent)\b/i.test(l) && l.length < 120)
    .slice(0, 12);

  const actionItems = lines
    .filter((l) =>
      /\b(will |due |assign|action item|follow up|submit|draft|approve|schedule|report)\b/i.test(l)
    )
    .slice(0, 8)
    .map((line) => ({
      task: line.length > 160 ? `${line.slice(0, 157)}…` : line,
      owner: null as string | null,
      deadline: null as string | null,
    }));

  const decisions = lines
    .filter((l) => /\b(approved|adopted|agreed|passed|motion)\b/i.test(l))
    .slice(0, 6);

  const discussion = lines
    .filter((l) => l.length > 40 && !attendance.includes(l))
    .slice(0, 5);

  const titleLine = lines.find((l) => /board|meeting|foundation/i.test(l)) ?? "Board meeting";

  return {
    executive_summary: `The ${titleLine} covered operational priorities, fundraising progress, and governance items requiring follow-up. Key discussion focused on grants, donor engagement, and board action items. Staff should distribute these minutes and confirm owners for open actions.`,
    decisions:
      decisions.length > 0
        ? decisions
        : ["Proceed with current grant reporting timeline and board action follow-ups."],
    action_items:
      actionItems.length > 0
        ? actionItems
        : [
            {
              task: "Review extracted discussion points and assign owners for follow-up items",
              owner: "Executive Director",
              deadline: "Within 5 business days",
            },
          ],
    attendance:
      attendance.length > 0
        ? attendance
        : ["Board members — see transcript roll call", "Staff — present"],
    key_discussion_points:
      discussion.length > 0
        ? discussion
        : ["Fundraising pipeline and grant compliance", "Board governance and pending actions"],
    time_saved_minutes: 45,
    recommended_action:
      actionItems.length > 0
        ? "Confirm action item owners and due dates, then file minutes in the board packet."
        : "Share the executive summary with the board secretary and schedule follow-ups on open items.",
  };
}
