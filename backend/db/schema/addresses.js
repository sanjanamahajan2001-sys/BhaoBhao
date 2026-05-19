// db/schema/addresses.js
import {
  pgTable,
  serial,
  integer,
  text,
  doublePrecision,
  timestamp,
  boolean,
  index,
} from 'drizzle-orm/pg-core';

export const addresses = pgTable(
  'addresses',
  {
    id: serial('id').primaryKey(),
    customer_id: integer('customer_id').notNull(),
    user_type: text('user_type'),
    user_name: text('user_name'),
    flat_no: text('flat_no'),
    floor: text('floor'),
    apartment_name: text('apartment_name'),
    full_address: text('full_address').notNull(),
    pincode: text('pincode').notNull(),
    location: text('location'),
    latitude: doublePrecision('latitude'),
    longitude: doublePrecision('longitude'),
    label: text('label'),
    status: text('status').notNull().default('Active'),
    isDefault: boolean('isDefault').notNull().default(false),
    special_instructions: text('special_instructions'),
    delete: boolean('delete').notNull().default(false),
    deletedat: timestamp('deletedat', { withTimezone: true }),
    sync: boolean('sync').notNull().default(false),
    lastsync: timestamp('lastsync', { withTimezone: true }),
    createdat: timestamp('createdat', { withTimezone: true }).notNull().defaultNow(),
    updatedat: timestamp('updatedat', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    idxCustomerId: index('idx_addresses_customer').on(table.customer_id),
    idxPincode: index('idx_addresses_pincode').on(table.pincode),
  })
);
