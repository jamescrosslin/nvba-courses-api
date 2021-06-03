const { Course, User } = require('../models');
const { asyncHandler } = require('../util');
const express = require('express');
const router = express.Router();

router
  .route('/')
  .get(
    asyncHandler(async (req, res) => {
      const courses = await Course.findAll({ include: User });
      res.json(courses);
    }),
  )
  .post(
    asyncHandler(async (req, res) => {
      const { title, description, estimatedTime, materialsNeeded, userId } = req.body;
      await Course.create({ title, description, estimatedTime, materialsNeeded, userId });

      res.status(201).send();
    }),
  );

router.param('id', async (req, res, next, id) => {
  try {
    req.course = await Course.findAll({ where: { id }, include: User });
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
    asyncHandler(async (req, res) => {
      const { title, description, estimatedTime, materialsNeeded } = req.body;
      await req.course.update({ title, description, estimatedTime, materialsNeeded });
      res.status(204).send();
    }),
  )
  .delete(
    asyncHandler(async (req, res) => {
      const didDelete = await req.course.destroy();
      if (didDelete) return res.status(204).send();
      throw new Error(`Couldn't delete`);
    }),
  );
module.exports = router;
