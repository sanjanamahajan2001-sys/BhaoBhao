// db/schema/pet_types.js
import {
  pgTable,
  serial,
  text,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

export const pet_types = pgTable("pet_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  status: text("status").notNull().default("Active"),
  delete: boolean("delete").notNull().default(false),
  deletedat: timestamp("deletedat", { withTimezone: true }),
  sync: boolean("sync").notNull().default(false),
  lastsync: timestamp("lastsync", { withTimezone: true }),
  createdat: timestamp("createdat", { withTimezone: true }).notNull().defaultNow(),
  updatedat: timestamp("updatedat", { withTimezone: true }).notNull().defaultNow(),
});
