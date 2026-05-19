import { relations } from "drizzle-orm";
import { users } from "../schema/users.js";
import { customers } from "../schema/customers.js";

export const userRelations = relations(users, ({ one }) => ({
  customer: one(customers, {
    fields: [users.user_id],
    references: [customers.id],
  }),
}));

export const customerRelations = relations(customers, ({ many }) => ({
  users: many(users),
}));
