// controllers/groomers.js
import { db } from "../db/index.js";
import { groomers as GroomersModel } from "../db/schema/groomers.js";
import { bookings as BookingsModel } from "../db/schema/bookings.js";
import { desc, eq, and, or, sql } from "drizzle-orm";
import toBoolean from "../utils/toBoolean.js";

class GroomersController {
  static async listAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const { level, search } = req.query;
      // Build dynamic WHERE conditions
      const filters = [
        eq(GroomersModel.delete, false)
      ];

      if (level) {
        filters.push(eq(GroomersModel.level, level));
      }

      if (search) {
        const searchText = `%${search}%`;
        filters.push(sql`
          (LOWER(${GroomersModel.groomer_name}) LIKE LOWER(${searchText})
          OR LOWER(${GroomersModel.email_id}) LIKE LOWER(${searchText})
          OR LOWER(${GroomersModel.mobile_number}) LIKE LOWER(${searchText}))
        `);
      }

      // Step 1: Count total groomers explicitly
      const countResult = await db
        .select({
          total: sql`count(*)`,
        })
        .from(GroomersModel)
        .where(and(...filters));

      const total = parseInt(countResult[0]?.total || 0, 10);

      // Step 2: Fetch paginated groomers
      const groomers = await db
        .select()
        .from(GroomersModel)
        .where(and(...filters))
        .orderBy(GroomersModel.groomer_name)
        .limit(limit)
        .offset(offset);

      const BASE_URL = process.env.SERVER_BASE_URL || 'http://localhost:3000';

      const groomersWithFullImageUrl = groomers.map(groomer => ({
        ...groomer,
        profile_image: groomer.profile_image
          ? `${BASE_URL}/uploads/${groomer.profile_image}`
          : null,
      }));

      return res.status(200).json({
        message: "Groomers fetched successfully",
        data: groomersWithFullImageUrl,
        pagination: {
          totalRecords: total,
          currentPage: page,
          perPage: limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("❌ Failed to fetch groomers:", error);
      return res
        .status(500)
        .json({ message: error.message || "Internal Server Error" });
    }
  }

  static async save(req, res) {
    try {
      const {
        IsNew,
        GroomerID,
        groomer_name,
        email_id,
        mobile_number,
        gender,
        dob,
        level,
      } = req.body;

      let result;
      let groomerIdInDb = null;

      if (toBoolean(IsNew)) {
        // ✅ Check if email already exists
        const [existingGroomer] = await db
          .select()
          .from(GroomersModel)
          .where(eq(GroomersModel.email_id, email_id))
          .limit(1);

        if (existingGroomer) {
          return res.status(400).json({
            message: 'A groomer with this email already exists.',
          });
        }

        // ✅ INSERT new groomer
        const [created] = await db
          .insert(GroomersModel)
          .values({
            groomer_name,
            email_id,
            mobile_number,
            gender,
            dob: dob ? new Date(dob) : null,
            level,
            createdat: new Date(),
            updatedat: new Date(),
          })
          .returning();

        result = { mode: "created", groomer: created };
        groomerIdInDb = created.id;

      } else {
        // ✅ UPDATE existing groomer
        if (!GroomerID) {
          throw new Error("Groomer ID is required for update.");
        }

        // Check if groomer is assigned to any active booking
        const [activeBooking] = await db
          .select()
          .from(BookingsModel)
          .where(
            and(
              eq(BookingsModel.groomer_id, GroomerID),
              eq(BookingsModel.delete, false),
              or(
                eq(BookingsModel.status, "Scheduled"),
                eq(BookingsModel.status, "In Progress")
              )
            )
          )
          .limit(1);

        if (activeBooking) {
          throw new Error("Cannot update groomer: assigned to active bookings.");
        }

        const [updated] = await db
          .update(GroomersModel)
          .set({
            groomer_name,
            email_id,
            mobile_number,
            gender,
            dob: dob ? new Date(dob) : null,
            level,
            updatedat: new Date(),
          })
          .where(eq(GroomersModel.id, GroomerID))
          .returning();

        result = { mode: "updated", groomer: updated };
        groomerIdInDb = GroomerID;
      }

      // Optionally handle profile picture upload if present
      const uploadedFile = req.file;
      let filePath = null;
      if (uploadedFile) {
        const { filename } = uploadedFile;
        filePath = `${req.uploadPath}/${filename}`;

        await db
          .update(GroomersModel)
          .set({
            profile_image: [filePath],
          })
          .where(eq(GroomersModel.id, groomerIdInDb));
      }

      return res.status(200).json({
        message: `Groomer ${result.mode} successfully.`,
        data: result.groomer,
      });

    } catch (error) {
      console.error("❌ Failed to create/update groomer:", error);

      return res.status(500).json({
        message: error.message || "Internal Server Error",
      });
    }
  }

  // DELETE /groomers/:id
  static async delete(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: "Groomer ID is required." });
      }

      // Check if groomer exists
      const [existingGroomer] = await db
        .select()
        .from(GroomersModel)
        .where(eq(GroomersModel.id, id))
        .limit(1);

      if (!existingGroomer) {
        return res.status(404).json({ message: "Groomer not found." });
      }

      // Check if groomer is assigned to any active booking
      const [activeBooking] = await db
        .select()
        .from(BookingsModel)
        .where(
          and(
            eq(BookingsModel.groomer_id, id),
            eq(BookingsModel.delete, false),
            or(
              eq(BookingsModel.status, "Scheduled"),
              eq(BookingsModel.status, "In Progress")
            )
          )
        )
        .limit(1);

      if (activeBooking) {
        return res.status(400).json({
          message: "Cannot delete groomer: assigned to active bookings.",
        });
      }

      // Soft delete
      await db
        .update(GroomersModel)
        .set({
          delete: true,
          deletedat: new Date(),
          updatedat: new Date(),
        })
        .where(eq(GroomersModel.id, id));

      return res.status(200).json({
        message: "Groomer deleted successfully.",
      });

    } catch (error) {
      console.error("❌ Failed to delete groomer:", error);
      return res.status(500).json({
        message: error.message || "Internal Server Error",
      });
    }
  }

}

export default GroomersController;
