import {
  pgTable,
  serial,
  bigint,
  text,
  smallint,
  timestamp,
  jsonb,
  bigserial,
} from "drizzle-orm/pg-core";
import { users } from "./users.js";
import { pgEnum } from "drizzle-orm/pg-core";

// Define enums
export const otpChannelEnum = pgEnum("otp_channel", ["email", "sms"]);
export const otpPurposeEnum = pgEnum("otp_purpose", [
  "verify_contact",
  "login",
  "password_reset",
  "2fa",
]);
export const userTypeEnum = pgEnum("user_type", ["customer", "groomer"]);

export const otpChallenges = pgTable("otp_challenges", {
  id: bigserial("id", { mode: "number" }).primaryKey(),

  user_id: bigint("user_id", { mode: "number" })
    .notNull(),

  user_type: userTypeEnum("user_type").notNull().default("customer"),
    
  channel: otpChannelEnum("channel").notNull(),   // ✅ enum
  purpose: otpPurposeEnum("purpose").notNull(),   // ✅ enum

  code_hash: text("code_hash"),
  code_len: smallint("code_len").default(6),

  expires_at: timestamp("expires_at", { withTimezone: true }),

  sent_at: timestamp("sent_at", { withTimezone: true }).notNull().defaultNow(),
  consumed_at: timestamp("consumed_at", { withTimezone: true }),
  invalidated_at: timestamp("invalidated_at", { withTimezone: true }),

  verify_attempts: smallint("verify_attempts").notNull().default(0),

  metadata: jsonb("metadata"),

  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
