const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const bearerHeader = req.header("Authorization");
  const xAuthToken = req.header("x-auth-token");

  let token = null;

  if (bearerHeader && bearerHeader.startsWith("Bearer ")) {
    token = bearerHeader.split(" ")[1];
  } else if (xAuthToken) {
    token = xAuthToken;
  }

  if (!token) {
    console.log(`❌ No auth token provided for ${req.method} ${req.path}`);
    return res.status(401).json({
      success: false,
      msg: "No token, authorization denied",
    });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || "exam_management_secret_token";
    const decoded = jwt.verify(token, jwtSecret);

    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    console.log(
      `✅ Authenticated user: ${req.user.id}, role: ${req.user.role}`
    );
    next();
  } catch (err) {
    console.error(
      `Token verification error for ${req.method} ${req.path}:`,
      err.message
    );

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        msg: "Token has expired, please login again",
      });
    } else if (err.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        msg: "Invalid token format",
      });
    }

    return res.status(401).json({
      success: false,
      msg: "Token verification failed",
    });
  }
};
