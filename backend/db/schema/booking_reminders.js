// db/schema/addresses.js
import {
  pgTable,
  serial,
  integer,
  text,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';

export const booking_reminders = pgTable(
  'booking_reminders',
  {
    id: serial("id").primaryKey(),
    booking_id: integer("booking_id")
      .notNull(),
    user_id: integer("user_id"),
    user_type: text("user_type"),
    identifier: text("identifier").notNull(),
    mode: text("mode").notNull(),
    sent_at: timestamp('sent_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    bookingIdIdx: index("idx_booking_reminders_booking_id").on(table.booking_id),
    sentAtIdx: index("idx_booking_reminders_sent_at").on(table.sent_at),
  })
);
