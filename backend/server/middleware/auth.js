import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { Admin } from "../models.js";
import { manilaParts } from "../time.js";

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("JWT_SECRET is not configured.");
    }
    return "kilos-insecure-development-secret";
  }
  return secret;
}

export function signToken(admin) {
  return jwt.sign(
    { sub: admin._id.toString(), role: admin.role, email: admin.email },
    getJwtSecret(),
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) {
      return res.status(401).json({ message: "Authentication required." });
    }

    const payload = jwt.verify(token, getJwtSecret());
    const admin = await Admin.findById(payload.sub).select("-passwordHash");
    if (!admin) {
      return res.status(401).json({ message: "Account no longer exists." });
    }

    req.admin = admin;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Session expired. Please sign in again." });
    }
    return res.status(401).json({ message: "Invalid session. Please sign in again." });
  }
}

export function publicAdmin(admin) {
  return {
    id: admin._id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
    lastLoginAt: admin.lastLoginAt,
  };
}

export function newReferenceNo() {
  const { year } = manilaParts();
  const random = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `KILOS-${year}-${random}`;
}
