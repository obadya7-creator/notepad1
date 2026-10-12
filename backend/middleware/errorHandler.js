export const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Resource not found: [${req.method}] ${req.originalUrl}`,
  });
};

export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  let status = err.status || err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Handle malformed JSON body from express.json()
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    status = 400;
    message = "Malformed JSON payload in request body";
  } else if (err.name === "ValidationError") {
    // Mongoose schema validation error
    status = 400;
    const errorList = Object.values(err.errors || {}).map((e) => e.message);
    message = errorList.length > 0 ? errorList.join(", ") : err.message;
  } else if (err.name === "CastError") {
    // Mongoose CastError (e.g. invalid ObjectId)
    status = 400;
    message = `Invalid ID format for field '${err.path}': ${err.value}`;
  } else if (err.code === 11000) {
    // Mongo duplicate key error
    status = 409;
    message = "A resource with these unique values already exists";
  }

  res.status(status).json({
    success: false,
    status,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
