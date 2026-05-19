export const BOOKING_STATUS = {
  CONFIRMED: 'confirmed',
  SCHEDULED: 'scheduled',
  PENDING: 'pending',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const SORT_OPTIONS = {
  DATE: 'date',
  STATUS: 'status',
} as const;

export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 10,
  upcomingPast: 'upcoming' as const,
  search: '',
};

export const TABS = {
  UPCOMING: 'upcoming',
  PAST: 'past',
} as const;
