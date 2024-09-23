var express = require('express');
var app = express();
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require("mongoose");
require('dotenv').config();
 
var usersRout = require("./routes/users");

const cors = require('cors');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));

app.use(cors());

app.use("/api/user", usersRout);


// Database connection
mongoose.connect("mongodb://127.0.0.1:27017/ecom", {
  useUnifiedTopology: true,
  useNewUrlParser: true
}).then(() => {
  console.log("Connected to DB");
}).catch((error) => {
  console.error("DB connection error:", error);
});

// error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;