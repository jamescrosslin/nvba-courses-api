module.exports = {
  asyncHandler: (cb) => {
    return async (req, res, next) => {
      try {
        return await cb(req, res, next);
      } catch (err) {
        if (!res.headersSent) return next(err);
      }
    };
  },
};
