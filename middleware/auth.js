const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

exports.protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // 1. Check for missing token
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message:
        "Unauthorized: Missing or malformed Authorization header. Please log in.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Find user from token payload
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({
        message:
          "Unauthorized: User not found. Token may be invalid or expired.",
      });
    }

    // 4. Attach user to request object
    req.user = user;
    next();
  } catch (err) {
    // 5. Handle token verification errors
    return res.status(401).json({
      message: "Unauthorized: Invalid or expired token. Please log in again.",
      error: err.message,
    });
  }
};
