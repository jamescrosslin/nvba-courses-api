const { Course, User } = require('../models');
const { authenticateUser, asyncHandler, checkOwnership } = require('../middleware');
const express = require('express');
const router = express.Router();

const courseQueryOptions = {
  attributes: {
    exclude: ['createdAt', 'updatedAt'],
  },
  include: [
    {
      model: User,
      attributes: {
        exclude: ['password', 'createdAt', 'updatedAt'],
      },
    },
  ],
};

router
  // the following chained methods will all belong to the '/' path
  .route('/')
  .get(
    asyncHandler(async (req, res) => {
      const courses = await Course.findAll(courseQueryOptions);
      res.json(courses);
    }),
  )
  .post(
    authenticateUser,
    asyncHandler(async (req, res) => {
      /* 
        here we're destructuring unique props from req.body instead of spreading
        all of req.body to prevent SQL injection or other malicious activity through
        unanticipated props like aggregating functions
      */
      const { title, description, estimatedTime, materialsNeeded, userId } = req.body;
      const { id } = await Course.create({
        title,
        description,
        estimatedTime,
        materialsNeeded,
        userId,
      });
      res.location(`/api/courses/${id}`).status(201).send();
    }),
  );

/*
  The param router method allows us to execute a bit of code for all routes
  that have the id route parameter in one place instead of performing action
  individually in each route handler
*/
router.param('id', async (req, res, next, id) => {
  try {
    // finds course by primary key which is :id route parameter
    // saves found course to req.course to travel along through middleware
    req.course = await Course.findByPk(id, courseQueryOptions);
    next();
  } catch (err) {
    err.message = 'Could not find course with that id';
    err.status = 404;
    next(err);
  }
});

router
  .route('/:id')
  .get(asyncHandler(async (req, res) => res.json(req.course)))
  .put(
    authenticateUser,
    checkOwnership,
    asyncHandler(async (req, res) => {
      /* 
        here we're destructuring unique props from req.body instead of spreading
        all of req.body to prevent malicious activity through
        unanticipated props like aggregating functions
      */
      const { title, description, estimatedTime, materialsNeeded } = req.body;
      await req.course.update({ title, description, estimatedTime, materialsNeeded });
      res.status(204).send();
    }),
  )
  .delete(
    authenticateUser,
    checkOwnership,
    asyncHandler(async (req, res) => {
      const didDelete = await req.course.destroy();
      if (didDelete) return res.status(204).send();
      throw new Error(`Couldn't delete`);
    }),
  );
module.exports = router;
