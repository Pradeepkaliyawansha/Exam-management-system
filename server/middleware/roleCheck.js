// Middleware to check if the user has admin role
module.exports = {
  isAdmin: function (req, res, next) {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ msg: "Access denied. Admin privileges required." });
    }
    next();
  },

  isStudent: function (req, res, next) {
    if (req.user.role !== "student") {
      return res
        .status(403)
        .json({ msg: "Access denied. Student privileges required." });
    }
    next();
  },
};
