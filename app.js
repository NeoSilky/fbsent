var cors = require('cors');
var express = require('express');
var oauth = require("./oauth.js");
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var BearerStrategy = require('passport-http-bearer').Strategy;

var app = express();
app.use(cors());
app.use(express.static('public'));

passport.use(new FacebookStrategy(oauth.facebook,
  	function(accessToken, refreshToken, profile, done) {
  		console.log(accessToken);
  		console.log(refreshToken);
  		console.log(profile);
  		console.log(done);
  	}
));

app.get('/auth', passport.authenticate('facebook'));

app.get('/auth/callback', passport.authenticate('facebook', { 
	successRedirect: '/analyse',
    failureRedirect: '/' 
}));

app.post('/submitUser', function(req, res) {
    res.send("Hello");
});

app.listen(80);