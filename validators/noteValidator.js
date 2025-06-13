const { body, validationResult } = require("express-validator");

exports.validateNote = (req, res, next) => {
  const { name, content } = req.body;
  if (!name || name.trim().length < 3) {
    return res.status(400).json({
      message: "Name is required and must be at least 3 characters long",
    });
  }
  if (!content || content.trim().length < 10) {
    return res.status(400).json({
      message: "Content is required and must be at least 10 characters long",
    });
  }
  next();
};
