// db/schema/customers.js
import {
  pgTable,
  serial,
  text,
  index,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";

export const customers = pgTable(
  "customers",
  {
    id: serial("id").primaryKey(),
    customer_name: text("customer_name").notNull(),
    gender: text("gender").notNull(),
    mobile_number: text("mobile_number").notNull(),
    dob: timestamp("dob", { withTimezone: true }),
    profile_photo: text("profile_photo").array().notNull(),
    status: text("status").notNull().default("Active"),
    delete: boolean("delete").default(false),
    deletedat: timestamp("deletedat", { withTimezone: true }),
    sync: boolean("sync").default(false),
    lastsync: timestamp("lastsync", { withTimezone: true }),
    createdat: timestamp("createdat", { withTimezone: true }).defaultNow(),
    updatedat: timestamp("updatedat", { withTimezone: true }).defaultNow(),
  },
  (table) => {
    return {
      idx_customers_mobile: index("idx_customers_mobile").on(table.mobile_number),
      idx_customers_status: index("idx_customers_status").on(table.status),
    };
  }
);
