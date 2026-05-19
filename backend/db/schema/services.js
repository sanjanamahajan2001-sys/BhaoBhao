// db/schema/services.js
import {
  index,
  pgTable,
  serial,
  text,
  boolean,
  timestamp,
  integer,
  doublePrecision
} from "drizzle-orm/pg-core";

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  service_name: text("service_name").notNull(),
  category_id: integer("category_id").notNull(),
  sub_category_id: integer("sub_category_id").notNull(),
  pet_type: text("pet_type").array(),
  gender: text("gender").array(),
  breed: text("breed").array(),
  small_description: text("small_description"),
  description: text("description"),
  stats: text("stats"),
  validity_sessions: text("validity_sessions"),
  photos: text("photos").array(),
  priority: text("priority").notNull(),
  rating: doublePrecision("rating").default(0),
  total_ratings: integer("total_ratings").default(0),
  duration_minutes: integer("duration_minutes"),
  status: text("status").notNull().default("Active"),
  delete: boolean("delete").notNull().default(false),
  deletedat: timestamp("deletedat", { withTimezone: true }),
  sync: boolean("sync").notNull().default(false),
  lastsync: timestamp("lastsync", { withTimezone: true }),
  createdat: timestamp("createdat", { withTimezone: true }).notNull().defaultNow(),
  updatedat: timestamp("updatedat", { withTimezone: true }).notNull().defaultNow(),
  is_addon: boolean("is_addon").notNull().default(false),
  },
  (table) => {
    return {
      idx_services_category: index("idx_services_category").on(table.category_id),
      idx_services_sub_category: index("idx_services_sub_category").on(table.sub_category_id),
    };
  }
);
