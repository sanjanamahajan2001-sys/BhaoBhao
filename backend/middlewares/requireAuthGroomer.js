// middlewares/requireAuthGroomer.js
import jwt from 'jsonwebtoken';
import { db } from "../db/index.js";
import { groomers as GroomersModel } from "../db/schema/groomers.js";
import { eq } from "drizzle-orm";

export const requireAuthGroomer = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token missing' });
  }

  try {
    const secretKey = process.env.JWT_SECRET || 'my-pvt-key-2025';
    const decoded = jwt.verify(token, secretKey);

    // Fetch groomer from DB
    const [groomer] = await db.select()
      .from(GroomersModel)
      .where(eq(GroomersModel.id, decoded.userId))
      .limit(1);

    if (!groomer) {
      return res.status(401).json({ message: 'Groomer not found' });
    }

    // Check token version
    if (decoded.token_version !== groomer.token_version) {
      return res.status(401).json({ message: 'Token invalid: please login again' });
    }

    // Check role
    if (decoded.role !== 'groomer') {
      return res.status(401).json({ message: 'Groomers only: access denied' });
    }

    // Attach groomer info to request
    req.user = decoded;

    next();
  } catch (err) {
    console.error('❌ requireAuthGroomer error:', err);
    return res.status(401).json({ message: err.message || 'Invalid or expired token' });
  }
};
