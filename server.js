const express = require('express');
const fs = require('fs');
const path = require('path');
const cookieSession = require('cookie-session');
const createError = require('http-errors');

const bodyParser = require('body-parser');

const FeedbackService = require('./services/FeedbackService');
const SpeakersService = require('./services/SpeakerService');

const feedbackService = new FeedbackService('./data/feedback.json');
const speakersService = new SpeakersService('./data/speakers.json');

const routes = require('./routes');

const app = express();

app.locals.siteName = 'Doggies';

app.set('trust proxy', 1);

// set the view engine to ejs
app.set('view engine', 'ejs');

// index page
app.get('/', (req, res) => {
  res.render('pages/index');
});

// dogs page
app.get('/dogs', (req, res) => {
  res.render('pages/dogs');
});

app.use(
  cookieSession({
    name: 'session',
    keys: ['Ghdur687399s7w', 'hhjjdf89s866799'],
  })
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './views'));

app.locals.siteName = 'Paws & Claws';

app.use(express.static(path.join(__dirname, './static')));

app.use(async (request, response, next) => {
  try {
    const names = await speakersService.getNames();
    response.locals.speakerNames = names;
    return next();
  } catch (err) {
    return next(err);
  }
});

app.use(
  '/',
  routes({
    feedbackService,
    speakersService,
  })
);

app.use((request, response, next) => {
  return next(createError(404, 'File not found'));
});

app.get('/', (req, res, next) => {
  fs.readFile('/file-does-not-exist', (err, data) => {
    if (err) {
      next(err); // Pass errors to Express.
    } else {
      res.send(data);
    }
  });
});

// app.use((err, request, response, next) => {
//   response.locals.message = err.message;
//   console.error(err);
//   const status = err.status || 500;
//   response.locals.status = status;
//   response.status(status);
//   response.render('error');
//   next();
// });

// start the server listening for requests
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log('Server started successfully!');
});
