export const apiAuth = (req, res, next) => {
  // Read x-api-key header
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({ message: 'API key missing' });
  }

  try {
    // Compare with your expected API key (store securely in environment variable)
    const expectedKey = process.env.X_API_KEY_FIELD_PROXY;

    if (apiKey !== expectedKey) {
      return res.status(401).json({ message: 'Invalid API key' });
    }

    next();
  } catch (err) {
    console.error("API key verification failed:", err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
