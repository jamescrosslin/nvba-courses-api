const express = require('express');
const router = express.Router();
const { User } = require('../models');
const { authenticateUser, asyncHandler } = require('../util');

router
  .route('/')
  .get(
    authenticateUser,
    asyncHandler(async (req, res) => {
      const users = await User.findAll();
      res.json(users);
    }),
  )
  .post(
    asyncHandler(async (req, res) => {
      const { firstName, lastName, emailAddress, password } = req.body;
      await User.create({ firstName, lastName, emailAddress, password });
      res.status(201).json({ message: 'User Created' });
    }),
  );

module.exports = router;
