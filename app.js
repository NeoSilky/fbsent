var express = require('express');
var app = express();
var mongoose = require('mongoose');
var passport = require('passport');
var cors = require('cors');

//Stupid express requirements
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');

//Connect to the database
mongoose.connect('mongodb://localhost/passport-example');

require('./passport.js')(passport);

//Set up express options
app.use(cors());
app.use(cookieParser('supersecretsessions'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ 
	secret: 'supersecretsessions', 
	resave: true, 
	saveUninitialized: true,
	maxAge: 3600
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static('public'));

//Load the routes
require('./routes.js')(express, app, passport);

//Start listening
app.listen(80);
