// db/schema/pets.js
import {
  index,
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

export const pets = pgTable("pets", {
  id: serial("id").primaryKey(),
  customer_id: integer("customer_id").notNull(),
  pet_name: text("pet_name").notNull(),
  pet_gender: text("pet_gender").notNull(),
  nature: text("nature").notNull(),
  health_conditions: text("health_conditions").notNull(),
  skin_condition: text("skin_condition"),
  comments: text("comments"),

  pet_type_id: integer("pet_type_id").notNull(),
  breed_id: integer("breed_id").notNull(),
  owner_name: text("owner_name").notNull(),
  pet_dob: timestamp("pet_dob", { withTimezone: true }),
  photo_url: text("photo_url").array(),
  status: text("status").notNull().default("Active"),
  delete: boolean("delete").default(false).notNull(),
  deletedat: timestamp("deletedat", { withTimezone: true }),
  sync: boolean("sync").default(false).notNull(),
  lastsync: timestamp("lastsync", { withTimezone: true }),
  createdat: timestamp("createdat", { withTimezone: true }).defaultNow().notNull(),
  updatedat: timestamp("updatedat", { withTimezone: true }).defaultNow().notNull(),
},
  (table) => {
    return {
      idx_pets_customer: index("idx_pets_customer").on(table.customer_id),
      idx_pets_type: index("idx_pets_type").on(table.pet_type_id),
      idx_pets_breed: index("idx_pets_breed").on(table.breed_id),
    };
  }
);
