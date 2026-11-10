import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Admin, RefreshToken } from "../models.js";
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

/* -------------------------------------------------------------------------- */
/* Access token (short-lived JWT, ~15 minutes)                                */
/* -------------------------------------------------------------------------- */

export function signAccessToken(admin) {
  return jwt.sign(
    { sub: admin._id.toString(), role: admin.role, email: admin.email, type: "access" },
    getJwtSecret(),
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m" }
  );
}

/* -------------------------------------------------------------------------- */
/* Refresh token (long-lived, stored hashed in database, ~7 days)             */
/* -------------------------------------------------------------------------- */

const REFRESH_TOKEN_EXPIRES_IN = 7 * 24 * 60 * 60 * 1000; // 7 days

function hashToken(token) {
  return bcrypt.hash(token, 10);
}

export async function createRefreshToken(adminId) {
  const token = crypto.randomBytes(40).toString("hex");
  const hashed = await hashToken(token);
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN);

  await RefreshToken.create({
    admin: adminId,
    token: hashed,
    expiresAt,
  });

  return token;
}

export async function verifyRefreshToken(token) {
  // Find all non-expired tokens for lookup, then verify each by bcrypt
  const records = await RefreshToken.find({
    expiresAt: { $gte: new Date() },
  }).populate("admin");

  for (const record of records) {
    const matches = await bcrypt.compare(token, record.token);
    if (matches) {
      return record.admin;
    }
  }

  return null;
}

export async function revokeRefreshToken(token) {
  // Find and delete the matching refresh token by comparing hashes
  const records = await RefreshToken.find({});
  for (const record of records) {
    const matches = await bcrypt.compare(token, record.token);
    if (matches) {
      await record.deleteOne();
      return;
    }
  }
}

export async function revokeAllRefreshTokens(adminId) {
  await RefreshToken.deleteMany({ admin: adminId });
}

/* -------------------------------------------------------------------------- */
/* Auth middleware                                                            */
/* -------------------------------------------------------------------------- */

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) {
      return res.status(401).json({ message: "Authentication required." });
    }

    const payload = jwt.verify(token, getJwtSecret());
    if (payload.type !== "access") {
      return res.status(401).json({ message: "Invalid token type." });
    }

    const admin = await Admin.findById(payload.sub).select("-passwordHash");
    if (!admin) {
      return res.status(401).json({ message: "Account no longer exists." });
    }

    req.admin = admin;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Access token expired. Please refresh." });
    }
    return res.status(401).json({ message: "Invalid session. Please sign in again." });
  }
}

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.admin || !allowedRoles.includes(req.admin.role)) {
      return res.status(403).json({ message: "Access denied." });
    }
    next();
  };
}

export function publicAdmin(admin) {
  return {
    id: admin._id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
    position: admin.position,
    idNumber: admin.idNumber,
    lastLoginAt: admin.lastLoginAt,
  };
}

export function newReferenceNo() {
  const { year } = manilaParts();
  const random = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `KILOS-${year}-${random}`;
}
