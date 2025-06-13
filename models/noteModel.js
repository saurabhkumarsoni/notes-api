const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    content: { type: String, required: true },
    quoteId: { type: String }, // added
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Note", noteSchema);
