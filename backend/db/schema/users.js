
import {
  pgTable,
  serial,
  text,
  boolean,
  timestamp,
  integer,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id"),
  user_name: text("user_name"),
  email_id: text("email_id"),
  status: text("status").default("Active"),
  invitation_status: text("invitation_status"),
  profile_image: text("profile_image"),
  mobile_number: text("mobile_number"),
  teams: text("teams").array(),
  password: text("password"),
  device_token_id: text("device_token_id"),
  otp_id: integer("otp_id"),
  token_version: integer("token_version").default(0),
  created_by: text("created_by"),
  is_deleted: boolean("is_deleted").notNull().default(false),
  deleted_at: timestamp("deleted_at", { withTimezone: true }),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  last_login_at: timestamp("last_login_at", { withTimezone: true }),
  login_count: integer("login_count").default(0),
  first_login_at: timestamp("first_login_at", { withTimezone: true }),
  is_frequent_user: boolean("is_frequent_user").default(false),
});
