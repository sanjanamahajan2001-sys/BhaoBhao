import { db } from "./db/index.js"; // adjust path if needed
import { sql } from "drizzle-orm";

const checkConnection = async () => {
  console.log("🔍 Checking database connection...\n");

  const currentDb = await db.execute(sql`SELECT current_database() AS dbname`);
  const currentSchema = await db.execute(sql`SELECT current_schema() AS schema`);
  const tables = await db.execute(sql`
    SELECT table_schema, table_name
    FROM information_schema.tables
    WHERE table_name LIKE '%booking%';
  `);

  console.log("🧾 Connected Database:", currentDb[0]?.dbname || "(unknown)");
  console.log("🧩 Current Schema:", currentSchema[0]?.schema || "(unknown)");
  console.log("\n📋 Tables Found:");
  for (const t of tables) {
    console.log(` - ${t.table_schema}.${t.table_name}`);
  }

  process.exit(0);
};

checkConnection().catch((err) => {
  console.error("❌ DB check failed:", err);
  process.exit(1);
});
