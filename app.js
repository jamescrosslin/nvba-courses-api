'use strict';

// load modules
const express = require('express');
const morgan = require('morgan');
const { sequelize } = require('./models');

// variable to enable global error logging
const enableGlobalErrorLogging = process.env.ENABLE_GLOBAL_ERROR_LOGGING === 'true';

// create the Express app
const app = express();

// setup morgan which gives us http request logging
app.use(morgan('dev'));

// parse incoming JSON payloads
app.use(express.json());

// Link to database
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    try {
      await sequelize.sync();
      console.log('Synced with database successfully.');
    } catch (error) {
      console.error('Unable to sync with the database: ', error);
    }
  } catch (error) {
    console.error('Unable to connect to the database: ', error);
  }
})();

// setup a friendly greeting for the root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to North Valley Business Academy course management system!',
  });
});

// setup user routes
const usersRoutes = require('./routes/users.js');
app.use('/api/users', usersRoutes);

// setup courses routes
const coursesRoutes = require('./routes/courses.js');
app.use('/api/courses', coursesRoutes);

// send 404 if no other route matched
app.use((req, res) => {
  res.status(404).json({
    message: 'Route Not Found',
  });
});

// setup a global error handler
app.use((err, _req, res, _next) => {
  if (enableGlobalErrorLogging) {
    console.error(`Global error handler: ${JSON.stringify(err.stack)}`);
  }
  const errors = err.validationErrors || err.errors || [];
  res.status(err.status || 500).json({
    message: err.message,
    error: errors,
  });
});

// set our port
app.set('port', process.env.PORT || 5000);

// start listening on our port
const server = app.listen(app.get('port'), () => {
  console.log(`Express server is listening on port ${server.address().port}`);
});
