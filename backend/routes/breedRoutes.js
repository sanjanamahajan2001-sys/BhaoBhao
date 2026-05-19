import express from "express";
import { pool } from "../db/index.js";

const router = express.Router();

// GET top 5 popular breeds
router.get("/popular", async (req, res) => {
  try {
    const query = `
      SELECT 
        p.breed_id,
        b.breed_name,
        COUNT(*) AS total_bookings
      FROM bookings bk
      JOIN pets p ON bk.pet_id = p.id
      JOIN pet_breeds b ON p.breed_id = b.id
      WHERE bk.delete = false
      GROUP BY p.breed_id, b.breed_name
      ORDER BY total_bookings DESC
      LIMIT 5;
    `;
    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching popular breeds:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
