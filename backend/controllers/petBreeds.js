// controllers/PetsBreedsController.js
import { db } from "../db/index.js";
import { pet_breeds as PetBreedsModel } from "../db/schema/pet_breeds.js";
import { eq } from "drizzle-orm";

class PetsBreedsController {
  static async list(req, res) {
    try {
      const petBreeds = await db
        .select({
          id: PetBreedsModel.id,
          name: PetBreedsModel.breed_name,
          pet_type_id: PetBreedsModel.pet_type_id,
        })
        .from(PetBreedsModel)
        .where(eq(PetBreedsModel.status, "Active"))
        .orderBy(PetBreedsModel.breed_name);

      res.status(200).json({ data: petBreeds });
    } catch (error) {
      console.error("Failed to fetch pet breeds:", error);
      res.status(500).json({ message: "Failed to fetch pet breeds" });
    }
  }
}

export default PetsBreedsController;
