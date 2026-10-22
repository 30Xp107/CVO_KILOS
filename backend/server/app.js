import express from "express";
import cors from "cors";
import { connectDB } from "./db.js";
import routes from "./routes/index.js";

const app = express();

app.set("trust proxy", 1);
app.disable("x-powered-by");

const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

// In production, browser origins must be explicitly configured. This keeps a
// forgotten CORS_ORIGIN from silently exposing the API to every website.
const allowAllOrigins = allowedOrigins.length === 0 && process.env.NODE_ENV !== "production";
if (process.env.NODE_ENV === "production" && allowedOrigins.length === 0) {
  console.warn("CORS_ORIGIN is not set. Browser requests will be blocked in production.");
}

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  if (req.path.startsWith("/api")) {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    res.setHeader("Pragma", "no-cache");
  }
  next();
});

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowAllOrigins || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      const error = new Error("Origin not allowed by CORS.");
      error.status = 403;
      return callback(error);
    },
    credentials: false,
  })
);

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

// Establish (and cache) the MongoDB connection before hitting any route.
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("Database connection failed:", error.message);
    res.status(503).json({
      message:
        "The service is temporarily unavailable. Please try again shortly. (Database connection failed)",
    });
  }
});

app.use("/api", routes);

app.use((req, res) => {
  res.status(404).json({ message: "Endpoint not found." });
});

app.use((error, req, res, next) => {
  const status = error.status || 500;
  if (status >= 500) console.error("API error:", error);
  if (res.headersSent) return next(error);
  res.status(status).json({
    message:
      status === 500
        ? "Something went wrong on our end. Please try again."
        : error.message,
  });
});

export default app;
