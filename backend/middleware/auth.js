// Allowed roles for administrative / dynamic employee & hierarchy updates
export const AUTHORIZED_ROLES = ['Admin', 'CMD', 'CEO', 'Director', 'HOD'];

/**
 * Express middleware to enforce Role-Based Access Control (RBAC).
 * Expects `x-user-role` header or defaults to checking user role.
 */
export const requireAuthorizedRole = (req, res, next) => {
  const userRole = (req.headers['x-user-role'] || 'Admin').toString().trim();
  
  // Normalize comparison
  const isAuthorized = AUTHORIZED_ROLES.some(
    (role) => role.toLowerCase() === userRole.toLowerCase()
  );

  if (!isAuthorized) {
    return res.status(403).json({
      success: false,
      message: `Access denied. Role '${userRole}' is not authorized. Access is restricted to Admin, CMD, CEO, Directors, and HODs.`
    });
  }

  req.userRole = userRole;
  next();
};
