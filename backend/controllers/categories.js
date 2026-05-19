import { eq, asc } from "drizzle-orm";
import { db } from "../db/index.js";
import { categories as CategoriesModel } from "../db/schema/categories.js";

class CategoriesController {
  static async list(req, res) {
    try {
      const categories = await db
        .select()
        .from(CategoriesModel)
        .where(eq(CategoriesModel.delete, false))
        .orderBy(asc(CategoriesModel.id));

      return res.status(200).json({
        data: categories
      });
    } catch (error) {
      console.error("❌ Failed to fetch categories:", error);
      return res.status(500).json({
        message: error.message || "Internal Server Error",
      });
    }
  }
}

export default CategoriesController;
