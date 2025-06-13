// middleware/errorHandler.js
module.exports = (err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || "Internal Server Error",
    status,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
