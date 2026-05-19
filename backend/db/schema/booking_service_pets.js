import { pgTable, serial, integer, index } from "drizzle-orm/pg-core";
import { booking_services } from "./booking_services.js";

export const booking_service_pets = pgTable(
  "booking_service_pets",
  {
    id: serial("id").primaryKey(),
    booking_service_id: integer("booking_service_id")
      .notNull()
      .references(() => booking_services.id, { onDelete: "cascade" }),
    pet_id: integer("pet_id").notNull(),
  },
  (table) => {
    return {
      idx_booking_service_pets_service: index("idx_booking_service_pets_service").on(table.booking_service_id),
      idx_booking_service_pets_pet: index("idx_booking_service_pets_pet").on(table.pet_id),
    };
  }
);
