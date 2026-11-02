const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const routes = require("./routes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

// Log HTTP requests only if VERBOSE env var is set (process.env.VERBOSE=1 npm start)
if (process.env.VERBOSE) {
  app.use(morgan("dev"));
}
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Health check
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

// All API routes
app.use("/api", routes);

// Centralised error handler (must be last)
app.use(errorHandler);

module.exports = app;
