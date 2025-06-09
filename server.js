require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const noteRoutes = require("./routes/noteRoutes");
const cors = require("cors");
const morgan = require("morgan");

const app = express();

app.use(
  cors({
    origin: "http://localhost:4200",
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(express.json());

connectDB();

app.use("/api/notes", noteRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((req, res, next) => {
  console.log("CORS Request:", req.method, req.path);
  next();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
