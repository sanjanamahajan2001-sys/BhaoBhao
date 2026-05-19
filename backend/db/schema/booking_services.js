import {
  pgTable,
  serial,
  integer,
  doublePrecision,
  index,
} from "drizzle-orm/pg-core";
import { bookings } from "./bookings.js";

export const booking_services = pgTable(
  "booking_services",
  {
    id: serial("id").primaryKey(),
    booking_id: integer("booking_id")
      .notNull()
      .references(() => bookings.id, { onDelete: "cascade" }),
    service_pricing_id: integer("service_pricing_id").notNull(),
    parent_service_id: integer("parent_service_id"), 
    amount: doublePrecision("amount").notNull(),
    tax: doublePrecision("tax").notNull(),
    total: doublePrecision("total").notNull(),
  },
  (table) => {
    return {
      idx_booking_services_booking: index("idx_booking_services_booking").on(
        table.booking_id
      ),
      idx_booking_services_service: index("idx_booking_services_service").on(
        table.service_pricing_id
      ),
    };
  }
);
