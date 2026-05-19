// middlewares/requireAuthAdmin.js
import jwt from 'jsonwebtoken';
import { adminTokenVersion } from "../utils/adminToken.js";

export const requireAuthAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token missing' });
  }

  try {
    const secretKey = process.env.JWT_SECRET || 'my-pvt-key-2025';
    const decoded = jwt.verify(token, secretKey);

    // Save decoded user in req.user for later use
    req.user = decoded;

    // compare decoded.token_version with adminTokenVersion
    if (decoded.token_version !== adminTokenVersion) {
      return res.status(401).json({ message: 'Token invalidated' });
    }

    // Check for admin role
    if (decoded.role !== 'admin') {
      return res.status(401).json({ message: 'Admins only: access denied' });
    }

    next(); // User is admin → proceed
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
