import {
  pgTable,
  serial,
  text,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";

export const assets = pgTable("assets", {
  id: serial("id").primaryKey(),
  ad_name: text("ad_name").notNull(),
  image: text("image").array().notNull(),
  alt_text: text("alt_text"),
  link: text("link"),
  placement_area: text("placement_area").notNull(),
  start_date: timestamp("start_date", { withTimezone: true }).notNull(),
  end_date: timestamp("end_date", { withTimezone: true }).notNull(),
  status: text("status").notNull().default("Scheduled"),
  delete: boolean("delete").notNull().default(false),
  deletedat: timestamp("deletedat", { withTimezone: true }),
  sync: boolean("sync").notNull().default(false),
  lastsync: timestamp("lastsync", { withTimezone: true }),
  createdat: timestamp("createdat", { withTimezone: true }).notNull().defaultNow(),
  updatedat: timestamp("updatedat", { withTimezone: true }).notNull().defaultNow(),
});
