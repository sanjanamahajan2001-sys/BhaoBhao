// middleware/verifyApiKey.js
export const verifyApiKey = (req, res, next) => {
  const key = req.headers["x-api-key"];
  const allowedKeys = process.env.API_KEYS?.split(",") || [];

  if (!allowedKeys.includes(key)) {
    return res.status(403).json({ error: "Invalid API Key" });
  }

  next();
};
