// db/schema/pet_breeds.js
import {
  index,
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

export const pet_breeds = pgTable("pet_breeds", {
  id: serial("id").primaryKey(),
  breed_name: text("breed_name").notNull(),
  pet_type_id: integer("pet_type_id").notNull(),
  group_name: text("group_name"),
  origin: text("origin"),
  grooming_needs: text("grooming_needs"),
  small_max_age: integer("small_max_age"),
  medium_max_age: integer("medium_max_age"),
  large_max_age: integer("large_max_age"),
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
      idx_pet_breeds_type: index("idx_pet_breeds_type").on(table.pet_type_id),
    };
  }
);
