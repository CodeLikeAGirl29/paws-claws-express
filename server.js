const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cookieSession = require('cookie-session');
const createError = require('http-errors');

const FeedbackService = require('./services/FeedbackService');
const SpeakersService = require('./services/SpeakerService');

const app = express();
const PORT = 8080;

const feedbackService = new FeedbackService('./data/feedback.json');
const speakersService = new SpeakersService('./data/speakers.json');

const routes = require('./routes/index');

app.locals.siteName = 'Paws & Claws';

app.set('trust proxy', 1);

app.use(
  cookieSession({
    name: 'session',
    keys: ['Ghdur687399s7w', 'hhjjdf89s866799'],
  })
);
app.use(express.static(path.join(__dirname, './static')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.locals.siteName = 'Paws & Claws';

app.use(async (req, res, next) => {
  try {
    const names = await speakersService.getNames();
    res.locals.speakerNames = names;
    return next();
  } catch (err) {
    return next(err);
  }
});

app.use(
  routes({
      speakersService,
      feedbackService,
  })
);

app.use((request, response, next) => {
  return next(createError(404, 'File not found'));
});

app.use((err, request, response, next) => {
  response.locals.message = err.message;
  console.error(err);
  const status = err.status || 500;
  response.locals.status = status;
  response.status(status);
  response.render('error');
});

// start the server listening for requests
app.listen(PORT, () => console.log('Server is running...'));
