var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.get('/form', (req, res) => {
  res.render('form');
});

app.post('/submit', validateFormData, (req, res) => {
  const { firstName, email, birthDate } = req.body;

  const today = new Date();
  const birthDateObj = new Date(birthDate);
  const nextBirthday = new Date(today.getFullYear(), birthDateObj.getMonth(), birthDateObj.getDate());

  if (nextBirthday < today) {
    nextBirthday.setFullYear(today.getFullYear() + 1);
  }

  const daysToNextBirthday = Math.ceil((nextBirthday - today) / (1000 * 60 * 60 * 24));

  res.render('result', { firstName, email, birthDate, daysToNextBirthday });
});



app.use(function(req, res, next) {
  next(createError(404));
});


app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error', {
    message: 'Wystąpił błąd!',
    errors: [],
  });
});



module.exports = app;



function validateFormData(req, res, next) {
  const { firstName, email, birthDate } = req.body;
  const errors = [];

  if (!firstName || firstName.trim().length < 2) {
    errors.push("Imię musi zawierać co najmniej 2 znaki.");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push("Podaj poprawny adres e-mail.");
  }

  if (!birthDate || isNaN(Date.parse(birthDate))) {
    errors.push("Podaj prawidłową datę urodzenia.");
  } else {
    const birthDateObj = new Date(birthDate);
    const today = new Date();
    if (birthDateObj > today) {
      errors.push("Data urodzenia nie może być w przyszłości.");
    }
  }

  if (errors.length > 0) {
    return res.status(400).render('error', {
      message: 'Wystąpiły błędy walidacji:',
      errors,
    });
  }

  next();
}






