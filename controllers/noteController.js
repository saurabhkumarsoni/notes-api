const Note = require("../models/noteModel");
const axios = require("axios");
const NodeCache = require("node-cache");
const { v4: uuidv4 } = require("uuid");

const cache = new NodeCache({ stdTTL: 180 });

// Create Note
exports.createNote = async (req, res) => {
  try {
    const { name, content } = req.body;

    let quoteId;

    try {
      const quoteRes = await axios.get("https://api.quotable.io/random");
      quoteId = quoteRes.data._id;
    } catch (e) {
      console.warn("Quote API failed:", e.message);
      quoteId = uuidv4();
    }

    const note = new Note({
      name,
      content,
      userId: req.user._id,
      quoteId,
    });

    await note.save();

    clearUserNotesCache(req.user._id);
    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({
      error: "Server error while creating note",
      details: error.message,
    });
  }
};

// Get All Notes with Pagination
exports.getNotes = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const cacheKey = `notes:${userId}:${JSON.stringify(req.query)}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    const { search, fromDate, toDate, limit = 10, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    let query = { userId };
    if (search) {
      const regex = new RegExp(search, "i");
      query.$or = [{ name: regex }, { content: regex }];
    }
    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) query.createdAt.$gte = new Date(fromDate);
      if (toDate) query.createdAt.$lte = new Date(toDate);
    }

    const [notes, total] = await Promise.all([
      Note.find(query)
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }),
      Note.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);
    const response = { notes, total, page: parseInt(page), totalPages };

    cache.set(cacheKey, response);
    res.json(response);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching notes", error: err.message });
  }
};

// Get Single Note
exports.getNoteById = async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
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
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ error: "Note not found" });
    if (note.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Forbidden" });
    }

    note.name = name;
    note.content = content;
    await note.save();

    // Invalidate cache
    clearUserNotesCache(req.user._id);

    res.status(200).json(note);
  } catch (error) {
    res.status(500).json({ error: "Failed to update note" });
  }
};

// Delete Note
exports.deleteNote = async (req, res) => {
  try {
    // 1. Fetch note and check ownership
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ error: "Note not found" });
    if (note.userId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ error: "Forbidden: You don't own this note" });
    }

    // 2. Delete note
    await note.deleteOne();
    clearUserNotesCache(req.user._id);

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

const clearUserNotesCache = (userId) => {
  cache.keys().forEach((key) => {
    if (key.startsWith(`notes:${userId}`)) {
      cache.del(key);
    }
  });
};
