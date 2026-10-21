const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Not Found - Endpoint '${req.originalUrl}' does not exist on this server.`,
  });
};

module.exports = notFound;
