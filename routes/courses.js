const { Course, User } = require('../models');
const { authenticateUser, asyncHandler } = require('../util');
const express = require('express');
const router = express.Router();

router
  // the following chained methods will all belong to the '/' path
  .route('/')
  .get(
    asyncHandler(async (req, res) => {
      const courses = await Course.findAll({
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
      });
      res.json(courses);
    }),
  )
  .post(
    authenticateUser,
    asyncHandler(async (req, res) => {
      /* 
        here we're destructuring unique props from req.body instead of spreading
        all of req.body to prevent SQL injection or other malicious activity through
        unanticipated props 
      */
      const { title, description, estimatedTime, materialsNeeded, userId } = req.body;
      const { id } = await Course.create({
        title,
        description,
        estimatedTime,
        materialsNeeded,
        userId,
      });
      res.location(`/${id}`).status(201).send();
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
    // saves found course to req.course to travel along middleware
    req.course = await Course.findByPk(id, {
      attributes: {
        exclude: ['createdAt', 'updatedAt'],
      },
    });
    next();
  } catch (err) {
    err.message = 'Could not find course with that id';
    err.status = 404;
    next(err);
  }
});

router
  .route('/:id')
  .get(
    asyncHandler(async (req, res) => {
      res.json(req.course);
    }),
  )
  .put(
    authenticateUser,
    asyncHandler(async (req, res) => {
      if (req.currentUser.id !== req.course.userId) {
        const error = new Error();
        error.message = "Cannot delete another user's course";
        error.status = 403;
        throw error;
      }
      const { title, description, estimatedTime, materialsNeeded } = req.body;
      await req.course.update({ title, description, estimatedTime, materialsNeeded });
      res.status(204).send();
    }),
  )
  .delete(
    authenticateUser,
    asyncHandler(async (req, res) => {
      const didDelete = await req.course.destroy();
      if (didDelete) return res.status(204).send();
      throw new Error(`Couldn't delete`);
    }),
  );
module.exports = router;
