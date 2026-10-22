import app from "./server/app.js";

// Vercel detects this root Express application and deploys it as one function,
// forwarding every request path (including nested /api routes) to the app.
export default app;
