const express = require("express");
const router = express.Router();
const {
  createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
  searchNotes,
} = require("../controllers/noteController");
const { validateNote } = require("../validators/noteValidator");

// Routes
router.post("/", validateNote, createNote);
router.get("/search", searchNotes); // ✅ Place it before :id
router.get("/", getNotes);
router.get("/:id", getNoteById);
router.put("/:id", validateNote, updateNote);
router.delete("/:id", deleteNote);

module.exports = router;
