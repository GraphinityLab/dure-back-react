// authMiddleware.js

export const authMiddleware = (req, res, next) => {
  // Check if session exists and user is logged in
  if (req.session && req.session.user) {
    // Attach user info to request object for downstream routes
    req.user = req.session.user;
    return next();
  } else {
    return res.status(401).json({ message: 'Unauthorized: No active session' });
  }
};
