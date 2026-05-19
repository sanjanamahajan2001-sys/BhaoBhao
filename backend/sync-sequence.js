import { db } from "./db/index.js";
import { sql } from "drizzle-orm";

async function run() {
  try {
    console.log("🔄 Looking up the exact sequence name for bookings.id...");
    const seqResult = await db.execute(sql`SELECT pg_get_serial_sequence('bookings', 'id') as seq_name`);
    const seqName = seqResult[0]?.seq_name;

    if (!seqName) {
      console.log("⚠️ No active serial sequence found on bookings.id. Trying default...");
      await db.execute(sql`SELECT setval('bookings_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM bookings), false)`);
    } else {
      console.log(`🎯 Found sequence name: "${seqName}"`);
      console.log(`🔄 Synchronizing sequence "${seqName}" to match maximum seeded booking ID...`);
      await db.execute(sql`SELECT setval(${sql.raw(seqName)}, (SELECT COALESCE(MAX(id), 0) + 1 FROM bookings), false)`);
    }

    console.log("🎉 Sequence successfully synchronized! New bookings will now be created flawlessly.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to sync sequence:", error);
    process.exit(1);
  }
}

run();
