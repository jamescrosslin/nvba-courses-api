const express = require('express');
const router = express.Router();
const { User } = require('../models');

router
  .route('/')
  .get(async (req, res) => {
    try {
      const users = await User.findAll();
      res.json(users);
    } catch (err) {
      console.warn(err);
    }
  })
  .post(async (req, res) => {
    const { firstName, lastName, emailAddress, password } = req.body;
    try {
      await User.create({ firstName, lastName, emailAddress, password });
      res.status(201).json({ message: 'User Created' });
    } catch (err) {
      console.error(err);
    }
  });

module.exports = router;
