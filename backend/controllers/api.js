// controllers/apiController.js
import { db } from "../db/index.js";
import { addresses } from "../db/schema/addresses.js";
import { categories } from "../db/schema/categories.js";
import { groomers } from "../db/schema/groomers.js";
import * as schema from "../db/schema/index.js";
import { pet_types } from "../db/schema/pet_types.js";
import { transactions } from "../db/schema/transactions.js";
import bcrypt from "bcrypt";
import { eq, and, sql } from "drizzle-orm";

class APIController {
  static autoConvertTimestamps(data, tableName) {
    const rows = Array.isArray(data) ? data : [data];

    // Define which columns are actually timestamps/dates for each table
    const timestampColumnsMap = {
      addresses: [], // no timestamps here
      assets: ["start_date", "end_date"],
      bookings: ["appointment_time_slot"],
      customers: ["dob"],
      groomers: ["dob"],
      pets: ["pet_dob"],
      // add more table: [date columns] mappings as needed
    };

    const dateColumns = timestampColumnsMap[tableName] || [];

    return rows.map(row => {
      const newRow = { ...row };
      for (const key of dateColumns) {
        if (newRow[key] && typeof newRow[key] === 'string' && !isNaN(Date.parse(newRow[key]))) {
          newRow[key] = new Date(newRow[key]);
        }
      }
      return newRow;
    });
  }

  static async insert(req, res) {
    try {
      const { tableName, data } = req.body;

      if (!tableName || !Array.isArray(data) || data.length === 0) {
        return res.status(400).json({ message: "Invalid request body" });
      }
      
      const table = schema[tableName];
      if (!table) {
        return res.status(400).json({ message: `Table '${tableName}' not found` });
      }

      // Define allowed columns per table
      const allowedColumnsMap = {
        addresses: ["customer_id", "user_type", "user_name", "flat_no", "floor", "apartment_name", "full_address", "city", "state", "pincode", "location", "latitude", "longitude", "label", "status", "isDefault", "special_instructions"],
        assets: ["ad_name", "image", "alt_text", "link", "placement_area", "start_date", "end_date", "status"],
        bookings: ["order_id", "customer_id", "pet_id", "service_id", "service_pricing_id", "groomer_id", "address_id", "pet_size", "appointment_time_slot", "start_otp", "end_otp", "amount", "tax", "total", "status", "notes", "payment_method"],
        categories: ["name", "priority", "description", "photos", "status"],
        customers: ["customer_name", "gender", "mobile_number", "dob", "profile_photo", "status"],
        groomers: ["groomer_name", "gender", "email_id", "mobile_number", "profile_image", "dob", "level", "status"],
        pet_breeds: ["breed_name", "pet_type_id", "group_name", "origin", "grooming_needs", "small_max_age", "medium_max_age", "large_max_age", "status"],
        pet_types: ["name", "status"],
        pets: ["customer_id", "pet_name", "pet_gender", "pet_type_id", "breed_id", "owner_name", "pet_dob", "photo_url", "status"],
        service_pricings: ["service_id", "pet_size", "groomer_level", "mrp", "discounted_price", "status"],
        services: ["service_name", "category_id", "sub_category_id", "pet_type", "gender", "breed", "small_description", "description", "stats", "validity_sessions", "photos", "priority", "rating", "total_ratings", "duration_minutes", "status"],
        sub_categories: ["sub_category_name", "category_id", "priority", "description", "photos", "status"],
        transactions: ["booking_id", "amount", "method", "status"],
        users: ["user_id", "user_name", "email_id", "status", "invitation_status", "profile_image", "mobile_number", "teams", "password", "device_token_id"],
      };

      const allowedColumns = allowedColumnsMap[tableName];
      if (!allowedColumns) {
        return res.status(500).json({ message: `Allowed columns not defined for table '${tableName}'` });
      }

      // Validate each row: no unwanted columns allowed
      for (const row of data) {
        const unwantedCols = Object.keys(row).filter(c => !allowedColumns.includes(c));
        if (unwantedCols.length > 0) {
          return res.status(400).json({
            message: `Invalid or Not Allowed column(s) for table '${tableName}': ${unwantedCols.join(", ")}`
          });
        }
      }

      // Convert timestamps & hash password for users
      const processedData = await Promise.all(
        APIController.autoConvertTimestamps(data, tableName).map(async (row) => {
          const newRow = { ...row };

          // Hash password only for users table
          if (tableName === "users" && newRow.password) {
            const saltRounds = 10;
            newRow.password = await bcrypt.hash(newRow.password, saltRounds);
          }
          
          // handle defaults for missing optional fields
          // if (tableName === "customers") {
          //   newRow.gender = newRow.gender ?? '';
          //   newRow.mobile_number = newRow.mobile_number ?? '';
          //   newRow.profile_photo = newRow.profile_photo ?? [];
          // }
          // if (tableName === "pets") {
          //   newRow.pet_gender = newRow.pet_gender ?? '';
          //   newRow.photo_url = newRow.photo_url ?? [];
          // }

          return newRow;
        })
      );

      const insertedRows = await db.insert(table).values(processedData).returning({ id: table.id });

      res.status(200).json({
        message: `Successfully inserted ${processedData.length} rows into ${tableName}`,
        rowsInserted: processedData.length,
        table: tableName,
        insertedIds: insertedRows.map(row => row.id)
      });
    } catch (error) {
      console.error("Failed to insert data:", error);
      res.status(500).json({ message: "Failed to insert data", error: error.message });
    }
  }

  static async read(req, res) {
    try {
      const { tableName, condition } = req.body;

      // Validate tableName and condition object
      if (!tableName) {
        return res.status(400).json({ 
          error: "tableName is required" 
        });
      }

      if (typeof condition !== "object" || Object.keys(condition).length === 0) {
        return res.status(400).json({ 
          error: "At least one condition field is required" 
        });
      }

      // Whitelist of allowed tables
      const allowedTables = [
        "addresses", 
        "assets", 
        "bookings", 
        "categories", 
        "customers", 
        "groomers",
        "otp",
        "pet_breeds", 
        "pet_types", 
        "pets", 
        "service_pricings", 
        "services", 
        "sub_categories", 
        "transactions",
        "users",
      ];

      if (!allowedTables.includes(tableName)) {
        return res.status(403).json({ error: `Access to table ${tableName} is not allowed` });
      }

      const table = schema[tableName];
      if (!table) {
        return res.status(400).json({ error: `Invalid table name: ${tableName}` });
      }

      // Build filters (ensure all condition values are not undefined/null)
      const validConditions = Object.entries(condition).filter(([_, value]) => value !== undefined && value !== null);
      if (validConditions.length === 0) {
        return res.status(400).json({ error: "At least one valid condition field is required" });
      }

      const filters = validConditions.map(([key, value]) => eq(table[key], value));
      const whereClause = filters.length > 1 ? and(...filters) : filters[0];

      const rows = await db.select().from(table).where(whereClause);

      res.json({
        data: rows,
        rowCount: rows.length,
        table: tableName
      });

    } catch (error) {
      console.error("Failed to read data:", error);
      res.status(500).json({ error: "Failed to fetch data" });
    }
  }


  static async softDelete(req, res) {
    try {
      const { tableName, condition } = req.body;

      const allowedTables = [
        "addresses", 
        "assets", 
        "bookings", 
        "categories", 
        "customers", 
        "groomers",
        "pet_breeds", 
        "pet_types", 
        "pets", 
        "service_pricings", 
        "services", 
        "sub_categories", 
        "transactions",
        "users",
      ];

      if (!tableName || !condition || Object.keys(condition).length === 0) {
        return res.status(400).json({ error: "tableName and at least one condition are required" });
      }

      if (!allowedTables.includes(tableName)) {
        return res.status(400).json({ error: `Soft delete not allowed for table '${tableName}'` });
      }

      const table = schema[tableName];
      if (!table) {
        return res.status(400).json({ error: `Invalid table name: ${tableName}` });
      }

      // Build WHERE clause
      const validConditions = Object.entries(condition).filter(([_, v]) => v !== undefined && v !== null);
      if (validConditions.length === 0) {
        return res.status(400).json({ error: "At least one valid condition is required" });
      }
      const filters = validConditions.map(([k, v]) => eq(table[k], v));
      const whereClause = filters.length > 1 ? and(...filters) : filters[0];

      // Determine which columns to update for soft delete
      let updateData;
      if (tableName === "users") {
        if (table.is_deleted === undefined || table.deleted_at === undefined) {
          throw new Error("Soft-delete columns missing in users table. Required: is_deleted, deleted_at");
        }
        updateData = {
          is_deleted: true,
          deleted_at: sql`NOW()`,
        };
      } else {
        if (table.delete === undefined || table.deletedat === undefined) {
          throw new Error(`Soft-delete columns missing in table: ${tableName}. Required: delete, deletedat`);
        }
        updateData = {
          delete: true,
          deletedat: sql`NOW()`,
        };
      }

      // Perform update
      const updatedRows = await db
        .update(table)
        .set(updateData)
        .where(whereClause)
        .returning({ id: table.id });

      res.json({
        message: "Delete successful",
        rowCount: updatedRows.length,
        table: tableName,
        deletedIds: updatedRows.map(r => r.id),
      });

    } catch (err) {
      console.error("Failed to soft delete:", err);
      res.status(500).json({ error: err.message || "Failed to soft delete data" });
    }
  }


  static async update(req, res) {
    try {
      const { tableName, data, condition } = req.body;

      if (!tableName || !data || Object.keys(data).length === 0) {
        return res.status(400).json({ message: "tableName and data are required" });
      }

      if (!condition || Object.keys(condition).length === 0) {
        return res.status(400).json({ message: "At least one condition is required" });
      }

      const table = schema[tableName];
      if (!table) {
        return res.status(400).json({ message: `Table '${tableName}' not found` });
      }

      // Define allowed columns per table (reuse the same map as insert)
      const allowedColumnsMap = {
        addresses: ["customer_id", "user_type", "user_name", "flat_no", "floor", "apartment_name", "full_address", "city", "state", "pincode", "location", "latitude", "longitude", "label", "status", "isDefault", "special_instructions"],
        assets: ["ad_name", "image", "alt_text", "link", "placement_area", "start_date", "end_date", "status"],
        bookings: ["order_id", "customer_id", "pet_id", "service_id", "service_pricing_id", "groomer_id", "address_id", "pet_size", "appointment_time_slot", "start_otp", "end_otp", "amount", "tax", "total", "status", "notes", "payment_method"],
        categories: ["name", "priority", "description", "photos", "status"],
        customers: ["customer_name", "gender", "mobile_number", "dob", "profile_photo", "status"],
        groomers: ["groomer_name", "gender", "email_id", "mobile_number", "profile_image", "dob", "level", "status"],
        pet_breeds: ["breed_name", "pet_type_id", "group_name", "origin", "grooming_needs", "small_max_age", "medium_max_age", "large_max_age", "status"],
        pet_types: ["name", "status"],
        pets: ["customer_id", "pet_name", "pet_gender", "pet_type_id", "breed_id", "owner_name", "pet_dob", "photo_url", "status"],
        service_pricings: ["service_id", "pet_size", "groomer_level", "mrp", "discounted_price", "status"],
        services: ["service_name", "category_id", "sub_category_id", "pet_type", "gender", "breed", "small_description", "description", "stats", "validity_sessions", "photos", "priority", "rating", "total_ratings", "duration_minutes", "status"],
        sub_categories: ["sub_category_name", "category_id", "priority", "description", "photos", "status"],
        transactions: ["booking_id", "amount", "method", "status"],
        users: ["user_id", "user_name", "email_id", "status", "invitation_status", "profile_image", "mobile_number", "teams", "password", "device_token_id"],
      };

      const allowedColumns = allowedColumnsMap[tableName];
      if (!allowedColumns) {
        return res.status(500).json({ message: `Allowed columns not defined for table '${tableName}'` });
      }

      // Validate data columns
      const invalidCols = Object.keys(data).filter(c => !allowedColumns.includes(c));
      if (invalidCols.length > 0) {
        return res.status(400).json({
          message: `Invalid or not allowed column(s) for table '${tableName}': ${invalidCols.join(", ")}`
        });
      }

      // Convert timestamps & hash password if needed
      const processedData = { ...APIController.autoConvertTimestamps([data], tableName)[0] };

      if (tableName === "users" && processedData.password) {
        const saltRounds = 10;
        processedData.password = await bcrypt.hash(processedData.password, saltRounds);
      }

      if (tableName === "users") {
        processedData.updated_at = new Date();
      }
      else {
        processedData.updatedat = new Date();
      }

      // Build WHERE clause from condition
      const validConditions = Object.entries(condition).filter(([_, v]) => v !== undefined && v !== null);
      const filters = validConditions.map(([k, v]) => eq(table[k], v));
      const whereClause = filters.length > 1 ? and(...filters) : filters[0];

      const updatedRows = await db
        .update(table)
        .set(processedData)
        .where(whereClause)
        .returning({ id: table.id });

      res.json({
        message: "Update successful",
        rowCount: updatedRows.length,
        table: tableName,
        updatedIds: updatedRows.map(r => r.id),
      });

    } catch (error) {
      console.error("Failed to update data:", error);
      res.status(500).json({ message: "Failed to update data", error: error.message });
    }
  }


}

export default APIController;
