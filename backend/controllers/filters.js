import { and, eq, min, max } from "drizzle-orm";
import { db } from "../db/index.js";

// Schema imports
import { pet_types as PetTypesModel } from "../db/schema/pet_types.js";
import { pet_breeds as PetBreedsModel } from "../db/schema/pet_breeds.js";
import { service_pricings as ServicePricingModel } from "../db/schema/service_pricings.js";
import { services as ServicesModel } from "../db/schema/services.js";

class FiltersController {
  static async services_page(req, res) {
    try {
      // 1. Pet Types: id + name where status = true
      const petTypes = await db
        .select({
          id: PetTypesModel.id,
          name: PetTypesModel.name,
        })
        .from(PetTypesModel)
        .where(eq(PetTypesModel.status, "Active"));

      // 2. Pet Breeds: id + name where status = true
      const petBreeds = await db
        .select({
          id: PetBreedsModel.id,
          name: PetBreedsModel.breed_name,
          pet_type_id: PetBreedsModel.pet_type_id,
        })
        .from(PetBreedsModel)
        .where(eq(PetBreedsModel.status, "Active"));

      // 3. Pricing: get min & max price from service_pricings joined with services
      const [pricingRange] = await db
        .select({
          startPrice: min(ServicePricingModel.discounted_price),
          endPrice: max(ServicePricingModel.discounted_price),
        })
        .from(ServicePricingModel)
        .innerJoin(ServicesModel, eq(ServicePricingModel.service_id, ServicesModel.id))
        .where(eq(ServicesModel.status, "Active")); // consider only active services

      return res.status(200).json({
        petTypes,
        petBreeds,
        pricing: {
          startPrice: pricingRange.startPrice ?? 1000,
          endPrice: pricingRange.endPrice ?? 10000,
        },
      });
    } catch (error) {
      console.error("❌ Failed to fetch filters for services page:", error);
      return res.status(500).json({
        message: error.message || "Internal Server Error",
      });
    }
  }
}

export default FiltersController;
