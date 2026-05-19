// controllers/PetsTypesController.js
import { db } from "../db/index.js";
import { pet_types } from "../db/schema/pet_types.js";
import { eq } from "drizzle-orm";

class PetsTypesController {
  static async list(req, res) {
    try {      
      const petTypes = await db
        .select({
          id: pet_types.id,
          name: pet_types.name,
        })
        .from(pet_types)
        .where(eq(pet_types.status, "Active"))
        .orderBy(pet_types.name);

      res.status(200).json({ data: petTypes });
    } catch (error) {
      console.error("Failed to fetch pet types:", error);
      res.status(500).json({ message: "Failed to fetch pet types" });
    }
  }
}

export default PetsTypesController;
