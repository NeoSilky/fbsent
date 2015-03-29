var FacebookStrategy = require('passport-facebook').Strategy;
var User       		= require('./user.js');

module.exports = function(passport) {
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    passport.use(new FacebookStrategy({
        clientID: '1648771098677909',
        clientSecret: '9cc92d61326e31e53418b22e152d2928',
        callbackURL: 'http://brumhack.daniellockyer.com/auth/callback',
        passReqToCallback: true
    },
    function(req, token, refreshToken, profile, done) {
        process.nextTick(function() {
            User.findOrCreate(
                { user.oauthID : profile.id },
                { user.token : token },
                { user.name : profile.displayName },
                { user.created : Date.now() }
            ).success(function(user) {
            done(null, user);
            }).error(function(err) {  
            done(err);
            });

            /*if (!req.user) {
                User.findOne({ 'oauthID' : profile.id }, function(err, user) {
                    if (err)
                        return done(err);

                    if (user) {
                        // if there is a user id already but no token (user was linked at one point and then removed)
                        if (!user.token) {
                            user.oauthID = profile.id;
                            user.token = token;
                            user.name = profile.displayName;
                            user.created = Date.now();

                            user.save(function(err) {
                                if (err)
                                    return done(err);
                                    
                                return done(null, user);
                            });
                        }

                        return done(null, user); // user found, return that user
                    } else {
                        var newUser            = new User();

                        newUser.oauthID = profile.id;
                        newUser.token = token;
                        newUser.name = profile.displayName;
                        newUser.created = Date.now();

                        newUser.save(function(err) {
                            if (err)
                                return done(err);
                                
                            return done(null, newUser);
                        });
                    }
                });

            } else {
                var user            = req.user; 

                user.oauthID = profile.id;
                user.token = token;
                user.name = profile.displayName;
                user.created = Date.now();

                user.save(function(err) {
                    if (err)
                        return done(err);
                        
                    return done(null, user);
                });

            }*/
        });
    }));
};
