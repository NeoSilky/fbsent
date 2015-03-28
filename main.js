var cors = require('cors');
var express = require('express');

var app = express();
app.use(cors());
app.use(express.static('public'));

var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;

options = {  
    clientID: '1648771098677909',
    clientSecret: '9cc92d61326e31e53418b22e152d2928',
    callbackURL: 'http://localhost:3000/auth/callback'
};

passport.use(new FacebookStrategy(options,
  	function(accessToken, refreshToken, profile, done) {
  		User.findOrCreate(
            { facebookId: profile.id },
            function (err, result) {
                if(result) {
                    result.access_token = accessToken;
                    result.save(function(err, doc) {
                        done(err, doc);
                    });
                } else {
                    done(err, result);
                }
            }
        );
  	}
));

app.get('/auth', passport.authenticate('facebook'));

app.get('/auth/callback', passport.authenticate('facebook', { 
	successRedirect: '/',
	failureRedirect: '/login' 
}));

app.post('/submitUser', function(req, res) {
    res.send("Hello");
});

app.listen(80);