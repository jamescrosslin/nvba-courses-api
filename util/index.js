module.exports = {
  asyncHandler: (cb) => {
    return async (req, res, next) => {
      try {
        return await cb(req, res, next);
      } catch (err) {
        if (res.headersSent) return console.error('Error occurred after header sent: ', err);

        if (
          err.name === 'SequelizeValidationError' ||
          err.name === 'SequelizeUniqueConstraintError'
        ) {
          err.validationErrors = err.errors.map((err) => err.message);
          err.status = 400;
        }

        return next(err);
      }
    };
  },
};
