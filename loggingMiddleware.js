
module.exports = function loggingMiddleware(req, res, next) {
  const { method, url } = req;
  const timestamp = new Date().toISOString();

  req.customLog = `[${timestamp}] ${method} ${url}`;

  next();
};
