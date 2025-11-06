export const permissionMiddleware = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ message: 'Unauthorized: No session found' });
    }

    const userPermissions = req.session.user.permissions || [];

    if (!userPermissions.includes(requiredPermission)) {
      return res.status(403).json({ message: 'Forbidden: You do not have permission to perform this action' });
    }

    next();
  };
};
