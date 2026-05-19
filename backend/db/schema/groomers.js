// db/schema/groomers.ts
import {
  pgTable,
  serial,
  text,
  boolean,
  timestamp,
  index,
  uniqueIndex,
  integer,
} from "drizzle-orm/pg-core";

// Use non-deprecated format with indexes in 3rd argument
export const groomers = pgTable(
  "groomers",
  {
    id: serial("id").primaryKey(),
    groomer_name: text("groomer_name").notNull(),
    gender: text("gender").notNull(),
    email_id: text("email_id").notNull(),
    mobile_number: text("mobile_number").notNull(),
    profile_image: text("profile_image").array(),
    dob: timestamp("dob", { withTimezone: true }),
    level: text("level").notNull(),
    token_version: integer("token_version").default(0),
    status: text("status").notNull().default("Active"),
    delete: boolean("delete").notNull().default(false),
    deletedat: timestamp("deletedat", { withTimezone: true }),
    sync: boolean("sync").notNull().default(false),
    lastsync: timestamp("lastsync", { withTimezone: true }),
    createdat: timestamp("createdat", { withTimezone: true }).notNull().defaultNow(),
    updatedat: timestamp("updatedat", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    idx_groomers_email: uniqueIndex("idx_groomers_email").on(table.email_id),
    idx_groomers_level: index("idx_groomers_level").on(table.level),
  })
);
