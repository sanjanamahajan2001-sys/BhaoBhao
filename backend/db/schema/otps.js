import {
  pgTable,
  serial,
  text,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";

const otps = pgTable("otp", {
  id: serial("id").primaryKey(),
  phone: text("phone").notNull(),
  code: text("code").notNull(),
  status: boolean("status").default(false),
  issued_at: timestamp("issued_at", { withTimezone: true }).notNull().defaultNow(),
});

export default otps;
export const otp = otps;