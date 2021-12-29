require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const logger = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const favicon = require('serve-favicon');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const session = require('express-session');
const methodOverride = require('method-override');
const engine = require('ejs-mate');
const { User } = require('./models');
const index = require('./routes/index');
const posts = require('./routes/posts');
const reviews = require('./routes/reviews');
const auth = require('./routes/auth');
const users = require('./routes/users');
const { httpCode } = require('./helpers/constants');
const { ErrorHandler } = require('./helpers/error-handler');
const { apiLimit, jsonLimit } = require('./config/rate-limit.json');
const options = require('./config/config-options');
// const seedPosts = require('./seeds'); // auto creating new 40 posts
// seedPosts();

const { SESSION_SECRET, API_URL } = process.env;
const api = API_URL;
const app = express();

const formatsLogger = app.get('env') === 'development' ? 'dev' : 'short';
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'access.log'),
  { flags: 'a' }
);

app.set('trust proxy', 1); // Enable if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)

// Use ejs-locals for all ejs templates
app.engine('ejs', engine);

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// app.use(express.static('public'));
app.use(helmet(options));
app.use(cors());
app.options('*', cors());
app.use(express.json({ limit: jsonLimit }));
app.use(logger('combined', { stream: accessLogStream }, formatsLogger));
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico'))); // favicon in the public folder
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(methodOverride('_method'));
app.use(
  '/api/',
  rateLimit({
    windowMs: apiLimit.windowMs,
    max: apiLimit.max,

    handler: (req, res, next) => {
      next(
        new ErrorHandler(
          httpCode.BAD_REQUEST,
          'You have reached your request limit. Try later!'
        )
      );
    },
  })
);

// Add moment to every view
app.locals.moment = require('moment');

// Configure Passport and Sessions
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Local variables middleware
app.use((req, res, next) => {
  // req.user = {
  //   _id: '61aa3c8eb30f3b8b0c9f290c',
  //   username: 'Matt',
  //   // _id: '61aa40b3b1b96b2e222899e4',
  //   // username: 'Tom',
  //   // _id: '61aa97514b689787a5edfa6f',
  //   // username: 'Roma',
  // };
  res.locals.currentUser = req.user;
  res.locals.title = 'Surf Shop'; // Set default page title

  res.locals.success = req.session.success || ''; // Set success flash message
  delete req.session.success;

  res.locals.error = req.session.error || ''; // Set error flash message
  delete req.session.error;

  next(); // Continue on to next function in middleware chain
});

app.use(`${api}/`, index);
app.use(`${api}/posts`, posts);
app.use(`${api}/posts/:id/reviews`, reviews);
app.use(`${api}/auth`, auth);
app.use(`${api}/users`, users);

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Error handler
app.use((err, req, res, next) => {
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Render the error page
  res.status(err.status || 500);
  res.render('error');

  console.log(err);
  req.session.error = err.message;
  res.redirect('http://localhost:8080/api/v1');
});

module.exports = app;
