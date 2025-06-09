const Note = require("../models/noteModel");

// Create Note
exports.createNote = async (req, res) => {
  try {
    const { name, content } = req.body;
    const note = new Note({ name, content });
    await note.save();
    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ error: "Server error while creating note" });
  }
};

// Get All Notes with Pagination
exports.getNotes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const sortBy = req.query.sortBy || "createdAt";
    const order = req.query.order === "asc" ? 1 : -1;

    const [notes, total] = await Promise.all([
      Note.find()
        .sort({ [sortBy]: order }) // dynamic sort
        .skip(skip)
        .limit(limit),
      Note.countDocuments(),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      notes,
      total,
      page,
      totalPages,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch notes with pagination" });
  }
};

// Get Single Note
exports.getNoteById = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ error: "Note not found" });
    res.status(200).json(note);
  } catch (error) {
    res.status(500).json({ error: "Error fetching note" });
  }
};

// Update Note
exports.updateNote = async (req, res) => {
  try {
    const { name, content } = req.body;
    const note = await Note.findByIdAndUpdate(
      req.params.id,
      { name, content },
      { new: true, runValidators: true }
    );
    if (!note) return res.status(404).json({ error: "Note not found" });
    res.status(200).json(note);
  } catch (error) {
    res.status(500).json({ error: "Failed to update note" });
  }
};

// Delete Note
exports.deleteNote = async (req, res) => {
  try {
    const note = await Note.findByIdAndDelete(req.params.id);
    if (!note) return res.status(404).json({ error: "Note not found" });
    res.status(200).json({ message: "Note deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete note" });
  }
};

// Search Notes with Pagination
exports.searchNotes = async (req, res) => {
  try {
    const query = req.query.query || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const sortBy = req.query.sortBy || "createdAt";
    const order = req.query.order === "asc" ? 1 : -1;

    const regex = new RegExp(query, "i");

    const [notes, total] = await Promise.all([
      Note.find({
        $or: [{ name: regex }, { content: regex }],
      })
        .sort({ [sortBy]: order })
        .skip(skip)
        .limit(limit),
      Note.countDocuments({
        $or: [{ name: regex }, { content: regex }],
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      notes,
      total,
      page,
      totalPages,
    });
  } catch (error) {
    res.status(500).json({ error: "Error fetching search results" });
  }
};
