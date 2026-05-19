// db/schema/transactions.js
import {
  pgTable,
  serial,
  integer,
  text,
  boolean,
  doublePrecision,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";


export const transactions = pgTable(
  "transactions",
  {
    id: serial("id").primaryKey(),
    transaction_id: text("transaction_id").notNull(),
    booking_id: integer("booking_id").notNull(),
    amount: doublePrecision("amount").notNull(),
    method: text("method").notNull(),
    notes: text("notes"),
    status: text("status").notNull().default("Pending"),
    delete: boolean("delete").notNull().default(false),
    deletedat: timestamp("deletedat", { withTimezone: true }),
    sync: boolean("sync").notNull().default(false),
    lastsync: timestamp("lastsync", { withTimezone: true }),
    createdat: timestamp("createdat", { withTimezone: true }).notNull().defaultNow(),
    updatedat: timestamp("updatedat", { withTimezone: true }).notNull().defaultNow(),
  },
  (transactions) => ({
    idx_transaction_id: index("idx_transaction_id").on(transactions.transaction_id),
    idx_booking_id: index("idx_booking_id").on(transactions.booking_id),
  })
);
