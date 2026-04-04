import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { getAuthCookieName } from "../utils/authCookie.js";

export const protect = async (req, res, next) => {
  try {
    const cookieToken = req.cookies?.[getAuthCookieName()];
    const authHeader = req.headers.authorization;
    const bearerToken =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null;

    const token = cookieToken || bearerToken;

    if (!token) {
      return res.status(401).json({ message: "Not Authorized, no token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({ message: "User not Found" });
    }
    next();
  } catch (error) {
    console.error("Error: ", error.message);
    res.status(401).json({ message: "Not Authorized, token failed" });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res
      .status(403)
      .json({ message: "Not Authorized , only Admin access required" });
  }
};

export const requireRole = (...roles) => {
  const allowed = roles.flat().filter(Boolean);
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not Authorized" });
    }
    if (allowed.length && !allowed.includes(req.user.role)) {
      return res.status(403).json({ message: "Not Authorized for this role" });
    }
    next();
  };
};
