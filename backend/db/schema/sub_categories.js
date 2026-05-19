// db/schema/subCategories.js
import {
  index,
  pgTable,
  serial,
  text,
  boolean,
  timestamp,
  integer,
} from "drizzle-orm/pg-core";

export const sub_categories = pgTable("sub_categories", {
  id: serial("id").primaryKey(),
  sub_category_name: text("sub_category_name").notNull(),
  category_id: integer("category_id").notNull(),
  priority: integer("priority").notNull(),
  description: text("description"),
  photos: text("photos").array(),
  status: text("status").notNull().default("Active"),
  delete: boolean("delete").notNull().default(false),
  deletedat: timestamp("deletedat", { withTimezone: true }),
  sync: boolean("sync").notNull().default(false),
  lastsync: timestamp("lastsync", { withTimezone: true }),
  createdat: timestamp("createdat", { withTimezone: true }).notNull().defaultNow(),
  updatedat: timestamp("updatedat", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => {
    return {
      idx_sub_categories_category: index("idx_sub_categories_category").on(table.category_id),
    };
  }
);
