import { db } from "../db/index.js";
import { sub_categories } from "../db/schema/sub_categories.js";
import { services } from "../db/schema/services.js";
import { service_pricings } from "../db/schema/service_pricings.js";
import { desc, eq, and } from "drizzle-orm";

class ServicesController {
  static async list(req, res) {
    try {
      const subCategoryId = req.params.id;
      if (!subCategoryId) {
        return res.status(400).json({ message: "Sub-category ID is required." });
      }

      // Fetch active services with is_addon field
      const allServices = await db
        .select({
          id: services.id,
          name: services.service_name,
          photos: services.photos,
          smallDescription: services.small_description,
          description: services.description,
          rating: services.rating,
          totalRatings: services.total_ratings,
          durationMinutes: services.duration_minutes,
          petType: services.pet_type,
          petBreed: services.breed,
          subCategoryId: sub_categories.id,
          subCategoryName: sub_categories.sub_category_name,
          is_addon: services.is_addon, 
        })
        .from(services)
        .innerJoin(sub_categories, eq(services.sub_category_id, sub_categories.id))
        .where(
          and(
            eq(services.status, "Active"),
            eq(services.sub_category_id, subCategoryId)
          )
        );

      // For each service, fetch related pricing details
      const result = await Promise.all(
        allServices.map(async (service) => {
          const pricing = await db
            .select({
              id: service_pricings.id,
              pet_size: service_pricings.pet_size,
              groomer_level: service_pricings.groomer_level,
              mrp: service_pricings.mrp,
              discounted_price: service_pricings.discounted_price,
            })
            .from(service_pricings)
            .where(eq(service_pricings.service_id, service.id));

          return {
            id: service.id,
            name: service.name,
            photos: service.photos,
            smallDescription: service.smallDescription,
            description: service.description,
            rating: service.rating,
            totalRatings: service.totalRatings,
            durationMinutes: service.durationMinutes,
            petType: service.petType,
            petBreed: service.petBreed,
            subCategoryId: service.subCategoryId,
            subCategoryName: service.subCategoryName,
            is_addon: service.is_addon,
            pricing,
          };
        })
      );

      return res.status(200).json({ data: result });
    } catch (error) {
      console.error("❌ Failed to fetch services:", error);
      return res.status(500).json({ message: error.message || "Internal Server Error" });
    }
  }
}

export default ServicesController;
