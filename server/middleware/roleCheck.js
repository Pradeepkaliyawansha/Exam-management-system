// Middleware to check for specific user roles
const roleCheck = {
  isAdmin: function (req, res, next) {
    if (!req.user || req.user.role !== "admin") {
      return res
        .status(403)
        .json({ msg: "Access denied. Admin privileges required." });
    }
    next();
  },

  isStudent: function (req, res, next) {
    if (!req.user || req.user.role !== "student") {
      return res
        .status(403)
        .json({ msg: "Access denied. Student privileges required." });
    }
    next();
  },

  // Function that returns middleware for any specified role
  hasRole: function (role) {
    return function (req, res, next) {
      if (!req.user || req.user.role !== role) {
        return res
          .status(403)
          .json({ msg: `Access denied. ${role} privileges required.` });
      }
      next();
    };
  },
};

module.exports = roleCheck;
