/** Shared badge color helpers for donor engagement surfaces. */

export function donorScoreColor(score: number): string {
  if (score >= 70) return "text-green-600 border-green-200 bg-green-50";
  if (score >= 40) return "text-amber-600 border-amber-200 bg-amber-50";
  return "text-red-600 border-red-200 bg-red-50";
}

export function segmentBadgeColor(segment: string): string {
  const map: Record<string, string> = {
    "Major Gift": "bg-purple-100 text-purple-700 border-purple-200",
    "Mid-Level": "bg-blue-100 text-blue-700 border-blue-200",
    Grassroots: "bg-teal-100 text-teal-700 border-teal-200",
    Lapsed: "bg-red-100 text-red-700 border-red-200",
  };
  return map[segment] ?? "bg-gray-100 text-gray-600 border-gray-200";
}
