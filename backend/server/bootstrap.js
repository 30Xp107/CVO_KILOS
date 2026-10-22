import bcrypt from "bcryptjs";
import { Admin } from "./models.js";

/**
 * Creates the initial administrator from environment variables if the
 * database does not have any admin yet. Safe to call on each login.
 */
export async function ensureAdminAccount() {
  const existing = await Admin.estimatedDocumentCount();
  if (existing > 0) return null;

  const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "";
  const name = process.env.ADMIN_NAME || "KILOS Administrator";

  if (!email || !password) {
    const error = new Error(
      "No administrator account exists yet. Set ADMIN_EMAIL and ADMIN_PASSWORD in your environment, then sign in again."
    );
    error.status = 503;
    throw error;
  }

  if (password.length < 8) {
    const error = new Error("ADMIN_PASSWORD must be at least 8 characters long.");
    error.status = 503;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  try {
    return await Admin.create({ name, email, passwordHash, role: "admin" });
  } catch (err) {
    if (err?.code === 11000) return null; // created concurrently
    throw err;
  }
}
