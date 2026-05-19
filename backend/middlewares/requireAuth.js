import jwt from 'jsonwebtoken';
import { db } from '../db/index.js';
import { users as UsersModel } from '../db/schema/users.js';
import { eq } from 'drizzle-orm';

export const requireAuth = async(req, res, next) => {
  const authHeader = req.headers['authorization'];

  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token missing' });
  }

  try {
    const secretKey = process.env.JWT_SECRET || 'my-pvt-key-2025';
    const decoded = jwt.verify(token, secretKey);

    // fetch latest token_version from DB
    const [user] = await db
      .select({ id: UsersModel.id, token_version: UsersModel.token_version })
      .from(UsersModel)
      .where(eq(UsersModel.id, decoded.userId))
      .limit(1);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // check version mismatch
    if (decoded.token_version !== user.token_version) {
      return res.status(401).json({ message: 'Token invalidated. Please log in again.' });
    }
    
    // Optionally store user info for next middleware/routes
    req.user = decoded;

    next(); // Proceed to the next handler
  } catch (err) {
    return res.status(401).json({ message: err.message || 'Invalid or expired token' });
  }
};
