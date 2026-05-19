import { db } from "./db/index.js";
import { services as ServicesModel } from "./db/schema/services.js";
import { pet_breeds as PetBreedsModel } from "./db/schema/pet_breeds.js";
import { categories as CategoriesModel } from "./db/schema/categories.js";

async function run() {
  try {
    console.log("=== SERVICES IN DATABASE ===");
    const services = await db.select().from(ServicesModel).limit(10);
    services.forEach(s => {
      console.log(`Service ID: ${s.id} | Name: "${s.service_name}" | CategoryID: ${s.category_id} | SubCategoryID: ${s.sub_category_id} | Photos:`, s.photos);
    });

    console.log("\n=== CATEGORIES IN DATABASE ===");
    const categories = await db.select().from(CategoriesModel).limit(10);
    categories.forEach(c => {
      console.log(`Category ID: ${c.id} | Name: "${c.name}" | Status: "${c.status}"`);
    });

    console.log("\n=== ACTIVE BREEDS IN DATABASE ===");
    const breeds = await db.select().from(PetBreedsModel).limit(20);
    breeds.forEach(b => {
      console.log(`Breed ID: ${b.id} | Name: "${b.breed_name}" | Status: "${b.status}" | PetTypeID: ${b.pet_type_id}`);
    });

    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

run();
