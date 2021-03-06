var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');
var tourtext = require('./routes/tourtext');
var dbroute = require('./routes/dbroute');
var route = require('./routes/route');
var spot = require('./routes/spot');
var detail = require('./routes/detail');
var payment = require('./routes/payment');
var about = require('./routes/about');
var vote = require('./routes/vote');
var pres = require('./routes/pres');

var app = express();

var engine = require('ejs-mate');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html', engine);
app.set('view engine', 'html');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);
app.use('/tourtext', tourtext);
app.use('/tour', route);
app.use('/spot', spot);
app.use('/dbroute', dbroute);
app.use('/detail', detail);
app.use('/payment', payment);
app.use('/about', about);
app.use('/vote', vote);
app.use('/pres', pres);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
