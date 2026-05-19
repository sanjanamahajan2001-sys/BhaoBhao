// controllers/PetsController.js
import { db } from "../db/index.js";
import { pets } from "../db/schema/pets.js";
import { pet_types } from "../db/schema/pet_types.js";
import { pet_breeds } from "../db/schema/pet_breeds.js";
import { eq, is, and, sql } from "drizzle-orm";
import toBoolean from "../utils/toBoolean.js";
import { bookings as BookingsModel } from "../db/schema/bookings.js";

class PetsController {
  static async list(req, res) {
    try {
      const customer_id = req.user.customerId;
      if (!customer_id) throw new Error("Customer ID not found in user session.");

      const allPets = await db
        .select({
          id: pets.id,
          pet_name: pets.pet_name,
          pet_dob: pets.pet_dob,
          breed_name: pet_breeds.breed_name,
          photo_url: pets.photo_url,
          status: pets.status,
          nature: pets.nature,
          health_conditions: pets.health_conditions,
          skin_condition: pets.skin_condition,
          comments: pets.comments,
          pet_details: pets,
          pet_breed_obj: pet_breeds,
          pet_type_obj: pet_types,
        })
        .from(pets)
        .leftJoin(pet_breeds, eq(pets.breed_id, pet_breeds.id))
        .leftJoin(pet_types, eq(pets.pet_type_id, pet_types.id))
        .where(
          and(
            eq(pets.delete, false),
            eq(pets.customer_id, customer_id)
          )
        )
        .orderBy(pets.pet_name);

      res.status(200).json({ data: allPets });
    } catch (error) {
      console.error("Failed to fetch pets:", error);
      res.status(500).json({ status: false, message: "Failed to fetch pets" });
    }
  }

  static async save(req, res) {
    try {
      const customer_id = req.user.customerId;
      if (!customer_id) throw new Error("Customer ID not found in user session.");

      const {
        IsNew,
        PetID,
        pet_name,
        pet_gender,
        pet_type_id,
        breed_id,
        owner_name,
        pet_dob,
        nature,
        health_conditions,
        skin_condition,
        comments,

        remove_profile_image = false
      } = req.body;

      let result;

      let pets_it_db = null;
      if (toBoolean(IsNew)) {
        // ✅ INSERT
        const [created] = await db
          .insert(pets)
          .values({
            customer_id,
            pet_name,
            pet_gender,
            pet_type_id,
            breed_id,
            owner_name,
            nature,
            health_conditions,
            skin_condition,
            comments,

            pet_dob: new Date(pet_dob),
            photo_url: [],
          })
          .returning();
        result = { mode: "created", pet: created };
        pets_it_db = created.id;
      } else {
        // ✅ UPDATE
        if (!PetID) {
          throw new Error("Pet ID is required for update.");
        }

        // 🚧 Check for active related bookings
        const [activeBooking] = await db
          .select()
          .from(BookingsModel)
          .where(
            and(
              eq(BookingsModel.pet_id, PetID),
              eq(BookingsModel.delete, false),
              sql`${BookingsModel.status} != 'Completed'`,
            )
          )
          .limit(1);

        if (activeBooking) {
          return res.status(400).json({
            message: "Cannot edit pet: related booking is still in progress or scheduled."
          });
        }

        const [updated] = await db
          .update(pets)
          .set({
            pet_name,
            pet_gender,
            pet_type_id,
            breed_id,
            owner_name,
            nature,
            health_conditions,
            skin_condition,
            comments,

            pet_dob: new Date(pet_dob),
            updatedat: new Date(),
          })
          .where(
            and(
              eq(pets.id, PetID),
              eq(pets.customer_id, customer_id),
              eq(pets.delete, false)
            )
          )
          .returning();
        result = { mode: "updated", pet: updated };
        pets_it_db = PetID;
      }

      // remove image
      if (toBoolean(remove_profile_image)) {
        // Update the user's profile image to null
        await db.update(pets)
          .set({
            photo_url: []
          })
          .where(eq(pets.id, pets_it_db));
      }

      // update pic path if uploaded
      const uploadedFile = req.file;
      let filePath = null;
      if (uploadedFile && !toBoolean(remove_profile_image)) {
        const { filename } = uploadedFile;

        // You can get relative path like this
        filePath = `${req.uploadPath}/${filename}`;

        // Update the user's profile image path
        await db.update(pets)
          .set({
            photo_url: [filePath]
          })
          .where(eq(pets.id, pets_it_db));
      }

      // Fetch the updated pet record
      const [finalPet] = await db
        .select()
        .from(pets)
        .where(eq(pets.id, pets_it_db))
        .limit(1);

      return res.status(200).json({
        message: `Pet ${result.mode} successfully.`,
        data: finalPet
      });
    } catch (error) {
      console.error("❌ Failed to save pet:", error);
      return res.status(500).json({
        message: error.message || "Internal Server Error",
      });
    }
  }

  static async delete(req, res) {
    try {
      const customer_id = req.user.customerId;
      const { id: PetID } = req.params;

      if (!PetID && !customer_id) {
        return res.status(400).json({ message: "Pet ID and customer id required." });
      }


      // 🚧 Check for active related bookings
      const [activeBooking] = await db
        .select()
        .from(BookingsModel)
        .where(
          and(
            eq(BookingsModel.pet_id, PetID),
            eq(BookingsModel.delete, false),
            sql`${BookingsModel.status} != 'Completed'`,
          )
        )
        .limit(1);

      if (activeBooking) {
        return res.status(400).json({
          message: "Cannot delete pet: related booking is still in progress or scheduled."
        });
      }

      const [deleted] = await db.update(pets)
        .set({
          delete: true,
          deletedat: new Date()
        })
        .where(
          and(
            eq(pets.id, PetID),
            eq(pets.customer_id, customer_id)
          )
        )
        .returning();

      if (!deleted) {
        return res.status(404).json({ message: "Pet not found or already deleted." });
      }

      return res.status(200).json({
        message: "Pet deleted successfully.",
      });

    } catch (error) {
      console.error("❌ Failed to delete pet:", error);
      return res.status(500).json({ message: error.message || "Internal Server Error" });
    }
  }

}

export default PetsController;
