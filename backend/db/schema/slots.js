// db/schema/slots.js
import {
  pgTable,
  serial,
  text,
  timestamp,
  boolean,
  index,
} from 'drizzle-orm/pg-core';

export const slots = pgTable(
  'slots',
  {
    id: serial('id').primaryKey(),
    slot: text('slot').notNull(), // Example: "09:00 - 10:00"
    status: text('status').notNull().default('Active'),
    delete: boolean('delete').notNull().default(false),
    deletedat: timestamp('deletedat', { withTimezone: true }),
    sync: boolean('sync').notNull().default(false),
    lastsync: timestamp('lastsync', { withTimezone: true }),
    createdat: timestamp('createdat', { withTimezone: true }).notNull().defaultNow(),
    updatedat: timestamp('updatedat', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    idxSlot: index('idx_slots_slot').on(table.slot),
  })
);
