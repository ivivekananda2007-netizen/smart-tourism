const jwt = require("jsonwebtoken");

function protect(req, res, next) {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) {
    res.status(401);
    return next(new Error("No token provided"));
  }

  try {
    const token = header.slice(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id };
    return next();
  } catch (e) {
    res.status(401);
    return next(new Error("Token invalid or expired"));
  }
}

module.exports = { protect };
