require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const logger = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
// const favicon = require('serve-favicon');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const passport = require('passport');
const session = require('express-session');
const methodOverride = require('method-override');
const { User } = require('./models');
// const { usersRoutes } = require('./routes');
const index = require('./routes/index');
const posts = require('./routes/posts');
const reviews = require('./routes/reviews');
const auth = require('./routes/auth');
const users = require('./routes/users');
const { httpCode } = require('./helpers/constants');
const { ErrorHandler } = require('./helpers/error-handler');
const { apiLimit, jsonLimit } = require('./config/rate-limit.json');

const { SESSION_SECRET } = process.env;
const api = process.env.API_URL;
const app = express();

const formatsLogger = app.get('env') === 'development' ? 'dev' : 'short';
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'access.log'),
  { flags: 'a' }
);

app.set('trust proxy', 1); // Enable if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// helmet without contentSecurityPolicy options blocks images
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        'default-src': ["'self'"],
        'base-uri': ["'self'"],
        'font-src': ["'self'", 'https:', 'data:'],
        'frame-ancestors': ["'self'"],
        'img-src': ["'self'", 'data:', 'http://res.cloudinary.com'],
        'script-src': ["'unsafe-inline'"],
        'script-src-attr': ["'none'"],
        'style-src': ["'self'", 'https:', "'unsafe-inline'"],
      },
    },
  })
);
app.use(cors());
app.options('*', cors());
app.use(express.json({ limit: jsonLimit }));
app.use(logger('combined', { stream: accessLogStream }, formatsLogger));
app.use(express.static(path.join(__dirname, 'public')));
// Uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
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

app.use(`${api}/`, index);
app.use(`${api}/posts`, posts);
app.use(`${api}/posts/:id/reviews`, reviews);
app.use(`${api}/auth`, auth);
app.use(`${api}/users`, users);

// app.use((req, res, _next) => {
//   res.status(httpCode.NOT_FOUND).json({
//     status: 'error',
//     code: httpCode.NOT_FOUND,
//     message: `Use api on routes: ${req.baseUrl}${api}/auth/register`,
//     data: 'Not Found',
//   });
// });

// app.use((error, _req, res, _next) => {
//   const status = error.status ? error.status : httpCode.INTERNAL_SERVER_ERROR;

//   res.status(status).json({
//     status: status === 500 ? 'fail' : 'error',
//     code: status,
//     message: error.message,
//     data: status === 500 ? 'Internal Server Error' : error.data,
//   });
// });

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Error handler
app.use(function (err, req, res, next) {
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
