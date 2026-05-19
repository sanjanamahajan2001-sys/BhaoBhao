import { eq, and, ne, desc, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { addresses as AddressesModel } from "../db/schema/addresses.js";
import { bookings as BookingsModel } from "../db/schema/bookings.js";

import toBoolean from "../utils/toBoolean.js";

class AddressesController {
  static async save(req, res) {
    try {
      const customer_id = req.user.customerId;
      if (!customer_id) throw new Error("Customer ID not found in user session.");

      const {
        AddressID,
        IsNew,
        flat_no,
        apartment_name,
        full_address,
        pincode,
        location,
        latitude,
        longitude,
        label,
        isDefault,
      } = req.body;

      let result;
      
      // ✅ Always update other addresses if isDefault is true
      if (toBoolean(isDefault)) {
        await db.update(AddressesModel)
          .set({ isDefault: false })
          .where(
            and(
              eq(AddressesModel.customer_id, customer_id),
              AddressID ? ne(AddressesModel.id, AddressID) : undefined // skip current address on update
            )
          );
      }

      if (toBoolean(IsNew)) {
        // ✅ INSERT
        const [created] = await db.insert(AddressesModel).values({
          customer_id,
          flat_no,
          apartment_name,
          full_address,
          pincode,
          label,
          isDefault: toBoolean(isDefault),
          location,
          latitude,
          longitude,
        }).returning();
        result = { mode: 'created', address: created };
      } else {
        // ✅ UPDATE
        if (!AddressID) {
          throw new Error("Address ID is required for update.");
        }

        // 🚧 Check for active related bookings
        const [activeBooking] = await db
          .select()
          .from(BookingsModel)
          .where(
            and(
              eq(BookingsModel.address_id, AddressID),
              eq(BookingsModel.delete, false),
              sql`${BookingsModel.status} != 'Completed'`,
            )
          )
          .limit(1);

        if (activeBooking) {
          return res.status(400).json({
            message: "Cannot edit address: related booking is still in progress or scheduled."
          });
        }

        const [updated] = await db.update(AddressesModel)
          .set({
            flat_no,
            apartment_name,
            full_address,
            pincode,
            label,
            isDefault: toBoolean(isDefault),
            location,
            latitude,
            longitude,
            updatedat: new Date()
          })
          .where(
            and(
              eq(AddressesModel.id, AddressID),
              eq(AddressesModel.customer_id, customer_id),
            )
          )
          .returning();
        result = { mode: 'updated', address: updated };
      }

      return res.status(200).json({
        message: `Address ${result.mode} successfully.`,
        data: result.address
      });

    } catch (error) {
      console.error("❌ Failed to save address:", error);
      return res.status(500).json({ message: error.message || "Internal Server Error" });
    }
  }

  static async list(req, res) {
    try {
      const customer_id = req.user.customerId;
      if (!customer_id) throw new Error("Customer ID not found in user session.");

      const addresses = await db
        .select()
        .from(AddressesModel)
        .where(
          and(
            eq(AddressesModel.customer_id, customer_id),
            eq(AddressesModel.delete, false)
          )
        )
        .orderBy(desc(AddressesModel.isDefault));

      return res.status(200).json({
        data: addresses
      });
    } catch (error) {
      console.error("❌ Failed to fetch addresses:", error);
      return res.status(500).json({ message: error.message || "Internal Server Error" });
    }
  }

  
  static async delete(req, res) {
    try {
      const customer_id = req.user.customerId;
      const { id: AddressID } = req.params;

      if (!AddressID && !customer_id) {
        return res.status(400).json({ message: "Address ID and customer id required." });
      }


      // 🚧 Check for active related bookings
      const [activeBooking] = await db
        .select()
        .from(BookingsModel)
        .where(
          and(
            eq(BookingsModel.address_id, AddressID),
            eq(BookingsModel.delete, false),
            sql`${BookingsModel.status} != 'Completed'`,
          )
        )
        .limit(1);

      if (activeBooking) {
        return res.status(400).json({
          message: "Cannot delete address: related booking is still in progress or scheduled."
        });
      }

      const [deleted] = await db.update(AddressesModel)
        .set({
          delete: true,
          deletedat: new Date()
        })
        .where(
          and(
            eq(AddressesModel.id, AddressID),
            eq(AddressesModel.customer_id, customer_id)
          )
        )
        .returning();

      if (!deleted) {
        return res.status(404).json({ message: "Address not found or already deleted." });
      }

      return res.status(200).json({
        message: "Address deleted successfully.",
        data: deleted
      });

    } catch (error) {
      console.error("❌ Failed to delete address:", error);
      return res.status(500).json({ message: error.message || "Internal Server Error" });
    }
  }

}

export default AddressesController;
