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
const { protect } = require("../middleware/auth");

// Apply JWT auth to all note routes
router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Notes
 *   description: API for managing notes
 */

// Routes
router.post("/", validateNote, createNote);
router.get("/search", searchNotes);
router.get("/", getNotes);
router.get("/:id", getNoteById);
router.put("/:id", validateNote, updateNote);
router.delete("/:id", deleteNote);

module.exports = router;
/**
 * @swagger
 * /api/notes:
 *   get:
 *     summary: Get all notes of the logged-in user
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of notes
 */
router.get("/", getNotes);
/**
 * @swagger
 * /api/notes:
 *   post:
 *     summary: Create a new note
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - content
 *             properties:
 *               name:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Note created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

router.post("/", validateNote, createNote);
/**
 * @swagger
 * /api/notes/search:
 *   get:
 *     summary: Search notes by name or content
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Search keyword
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of matching notes
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

router.get("/search", searchNotes);

/**
 * @swagger
 * /api/notes:
 *   get:
 *     summary: Get all notes of the authenticated user
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of user’s notes
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

router.get("/", getNotes);
/**
 * @swagger
 * /api/notes/{id}:
 *   get:
 *     summary: Get a note by ID (only if it belongs to the user)
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Note ID
 *     responses:
 *       200:
 *         description: Note data
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Note not found
 *       401:
 *         description: Unauthorized
 */

router.get("/:id", getNoteById);
/**
 * @swagger
 * /api/notes/{id}:
 *   put:
 *     summary: Update a note (only if it belongs to the user)
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Note ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - content
 *             properties:
 *               name:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Note updated
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Note not found
 *       401:
 *         description: Unauthorized
 */

router.put("/:id", validateNote, updateNote);
/**
 * @swagger
 * /api/notes/{id}:
 *   delete:
 *     summary: Delete a note (only if it belongs to the user)
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Note ID
 *     responses:
 *       200:
 *         description: Note deleted
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Note not found
 *       401:
 *         description: Unauthorized
 */

router.delete("/:id", deleteNote);
