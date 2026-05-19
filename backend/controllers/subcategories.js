import { eq, and, asc } from "drizzle-orm";
import { db } from "../db/index.js";
import { sub_categories as SubCategoriesModel } from "../db/schema/sub_categories.js";
import { services as ServicesModel } from "../db/schema/services.js";
import { service_pricings as ServicePricingsModel } from "../db/schema/service_pricings.js";

class SubCategoriesController {
  static async list(req, res) {
    try {
      const categoryId = req.params.id;
      if (!categoryId) {
        return res.status(400).json({ message: "Category ID is required" });
      }

      // Step 1: Get all sub-categories for the category
      const subCategories = await db
        .select({
          id: SubCategoriesModel.id,
          sub_category_name: SubCategoriesModel.sub_category_name,
          photos: SubCategoriesModel.photos,
          description: SubCategoriesModel.description,
        })
        .from(SubCategoriesModel)
        .where(
          and(
            eq(SubCategoriesModel.category_id, categoryId),
            eq(SubCategoriesModel.delete, false)
          )
        )
        .orderBy(asc(SubCategoriesModel.id));

      // Step 2: For each sub-category, fetch services
      const result = await Promise.all(
        subCategories.map(async (subCat) => {
          const services = await db
            .select({
              id: ServicesModel.id,
              name: ServicesModel.service_name,
              photos: ServicesModel.photos,
              smallDescription: ServicesModel.small_description,
              description: ServicesModel.description,
              rating: ServicesModel.rating,
              totalRatings: ServicesModel.total_ratings,
              durationMinutes: ServicesModel.duration_minutes,
              petType: ServicesModel.pet_type,
              petBreed: ServicesModel.breed,
              gender: ServicesModel.gender,
              is_addon: ServicesModel.is_addon,
            })
            .from(ServicesModel)
            .where(
              and(
                eq(ServicesModel.sub_category_id, subCat.id),
                eq(ServicesModel.status, "Active"),
                eq(ServicesModel.delete, false)
              )
            );

          // Step 3: For each service, fetch pricing
          const servicesWithPricing = await Promise.all(
            services.map(async (svc) => {
              const pricing = await db
                .select({
                  id: ServicePricingsModel.id,
                  pet_size: ServicePricingsModel.pet_size,
                  groomer_level: ServicePricingsModel.groomer_level,
                  mrp: ServicePricingsModel.mrp,
                  discounted_price: ServicePricingsModel.discounted_price,
                })
                .from(ServicePricingsModel)
                .where(eq(ServicePricingsModel.service_id, svc.id));

              return {
                ...svc,
                pricing,
              };
            })
          );

          return {
            ...subCat,
            services: servicesWithPricing,
          };
        })
      );

      return res.status(200).json({ data: result });
    } catch (error) {
      console.error("❌ Failed to fetch sub-categories with services:", error);
      return res.status(500).json({
        message: error.message || "Internal Server Error",
      });
    }
  }
}

export default SubCategoriesController;
