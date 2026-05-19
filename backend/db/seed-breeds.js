// backend/db/seed-breeds.js
import { db } from "./index.js";
import { pet_breeds as PetBreedsModel } from "./schema/pet_breeds.js";

const popularBreeds = [
  // 🐾 Dogs (pet_type_id: 1)
  { breed_name: "Golden Retriever", pet_type_id: 1, status: "Active" },
  { breed_name: "Labrador Retriever", pet_type_id: 1, status: "Active" },
  { breed_name: "German Shepherd", pet_type_id: 1, status: "Active" },
  { breed_name: "Beagle", pet_type_id: 1, status: "Active" },
  { breed_name: "Shih Tzu", pet_type_id: 1, status: "Active" },
  { breed_name: "Pug", pet_type_id: 1, status: "Active" },
  { breed_name: "Poodle", pet_type_id: 1, status: "Active" },
  { breed_name: "Siberian Husky", pet_type_id: 1, status: "Active" },
  { breed_name: "Cocker Spaniel", pet_type_id: 1, status: "Active" },
  { breed_name: "Pomeranian", pet_type_id: 1, status: "Active" },
  { breed_name: "Bulldog", pet_type_id: 1, status: "Active" },
  { breed_name: "Boxer", pet_type_id: 1, status: "Active" },
  { breed_name: "Rottweiler", pet_type_id: 1, status: "Active" },
  { breed_name: "Chihuahua", pet_type_id: 1, status: "Active" },
  { breed_name: "Great Dane", pet_type_id: 1, status: "Active" },
  { breed_name: "Indie / Mixed Breed (Dog)", pet_type_id: 1, status: "Active" },

  // 🐱 Cats (pet_type_id: 2)
  { breed_name: "Persian Cat", pet_type_id: 2, status: "Active" },
  { breed_name: "Siamese Cat", pet_type_id: 2, status: "Active" },
  { breed_name: "Maine Coon", pet_type_id: 2, status: "Active" },
  { breed_name: "Bengal Cat", pet_type_id: 2, status: "Active" },
  { breed_name: "Ragdoll", pet_type_id: 2, status: "Active" },
  { breed_name: "British Shorthair", pet_type_id: 2, status: "Active" },
  { breed_name: "Sphynx", pet_type_id: 2, status: "Active" },
  { breed_name: "Abyssinian", pet_type_id: 2, status: "Active" },
  { breed_name: "Indie / Mixed Breed (Cat)", pet_type_id: 2, status: "Active" }
];

async function seedBreeds() {
  try {
    console.log("🌱 Seeding popular dog & cat breeds...");
    
    // Clear the existing breeds to avoid duplicates
    console.log("🧹 Clearing old breed entries...");
    await db.delete(PetBreedsModel);

    // Bulk insert the breeds
    console.log("📦 Inserting new breeds...");
    await db.insert(PetBreedsModel).values(popularBreeds);
    
    console.log("🎉 Successfully seeded 25 popular dog and cat breeds!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to seed breeds:", error);
    process.exit(1);
  }
}

seedBreeds();
