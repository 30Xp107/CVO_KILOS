import express from "express";
import app from "./server/app.js";

// Vercel's Express builder detects the serverless entrypoint by a direct
// "express" import. The application itself is assembled in server/app.js.
// Keep this import even though the app instance comes from that module.
if (typeof express !== "function") {
  throw new Error("Express failed to load.");
}

export default app;
