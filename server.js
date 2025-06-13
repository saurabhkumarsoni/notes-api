require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const noteRoutes = require("./routes/noteRoutes");
const authRoutes = require("./routes/authRoutes");
const cors = require("cors");
const morgan = require("morgan");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// ✅ Swagger Setup
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Notes API",
      version: "1.0.0",
      description: "API for managing user notes with auth, search, and filters",
    },
    servers: [
      {
        url: "http://localhost:5000",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./routes/*.js"], // ← You can write Swagger comments in route files
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// ✅ Middleware
app.use(
  cors({
    origin: "http://localhost:4200",
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(express.json());

// ✅ Connect to DB
connectDB();

// ✅ Routes
app.use("/api/notes", noteRoutes);
app.use("/api/users", authRoutes);

// ✅ Debug log for CORS
app.use((req, res, next) => {
  console.log("CORS Request:", req.method, req.path);
  next();
});

// ✅ Not Found handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ✅ Internal Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong", error: err.message });
});

// ✅ Global error handler
app.use(errorHandler);

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT} — Swagger at /api-docs`)
);
