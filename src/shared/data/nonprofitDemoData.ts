/**
 * Nonprofit Demo Data
 *
 * Static demo data for the 5 nonprofit-specific pages.
 * No Supabase queries — these constants are used for UI rendering only.
 */

export const DEMO_DATA_HEALTH = {
  score: 82,
  duplicates: 12,
  incompleteProfiles: 34,
  householdInconsistencies: 7,
  softCreditAlerts: 3,
};

export const DEMO_RECONCILIATION = {
  unmatchedTransactions: 5,
  feeVarianceAlerts: 2,
  restrictedFundMismatches: 1,
  transactionsRequiringReview: 3,
};

export const DEMO_EVENTS = {
  recentEventName: "Annual Gala 2026",
  attendance: 120,
  untaggedAttendees: 15,
  volunteerInterestFlags: 8,
};

export const DEMO_GRANTS = {
  activeGrants: 6,
  upcomingDeadlines: 2,
  deadlineDaysThreshold: 14,
  grants: [
    {
      name: "Community Impact Fund",
      funder: "Ford Foundation",
      amount: 50000,
      utilized: 72,
      daysUntilDeadline: 8,
    },
    {
      name: "Youth Education Grant",
      funder: "Gates Foundation",
      amount: 25000,
      utilized: 45,
      daysUntilDeadline: 12,
    },
    {
      name: "Health Equity Initiative",
      funder: "Robert Wood Johnson",
      amount: 75000,
      utilized: 91,
      daysUntilDeadline: 34,
    },
  ],
};

export const DEMO_BOARD_REPORT = {
  status: "Draft Ready",
  totalDonors: 1240,
  donorGrowth: 8,
  totalRevenue: 284000,
  revenueVsGoal: 94,
  volunteerHours: 3200,
  programsActive: 7,
};
