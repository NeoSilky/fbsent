var User          = require('./user.js');
var sentiment = require('sentiment');
var request = require('request');

module.exports = function(express, app, passport) {
  var router = express.Router();

  router.get('/', function(req, res) {
    res.render('step1');
});

  router.get('/step2',ensureAuthenticated, function(req, res) {
    res.render('step2');
});

  router.get('/step3/:slug', ensureAuthenticated, function(req, res){
      res.render('step3', { threadId: req.params.slug });
  });

  router.get('/about', function(req, res) {
    res.render('about');
});

  router.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});

  router.get('/auth', passport.authenticate('facebook',  { scope: 'read_mailbox' }));

  router.get('/auth/callback', passport.authenticate('facebook', { 
  	successRedirect: '/step2',
    failureRedirect: '/',
    scope: 'read_mailbox'
}));

  router.get('/unlink', ensureAuthenticated, function(req, res) {
    var user            = req.user;
    user.token = undefined;
    user.save(function(err) {
      res.redirect('/');
  });
});

  router.get('/friends', ensureAuthenticated, function(req, res){
    User.findById(req.session.passport.user, function(err, user) {

      if (err){
        res.send(err);
        return;
    }

    if (user) {
        var FB = require('fb');
        FB.setAccessToken(user.token);

        FB.api('/me/threads?limit=200', 'GET', {fields: 'id,message_count,updated_time,participants'}, function(r) {
          var text=[];

          for (var i = 0; i < r.data.length; i++) { 
            if(r.data[i].participants.data.length != 2) continue;

            var index           = (r.data[i].participants.data[0].id == user.oauthID) ? 1 : 0;
            var data_pos        = r.data[i];
            var friend_details  = data_pos.participants.data[index];

            text.push({
              thread_id: data_pos.id,
              friend_id: friend_details.id,
              friend_name: friend_details.name,
              updated_time: data_pos.updated_time,
              count: data_pos.message_count
          });
        }

        res.send(text);
    });
    }
});
});

router.post('/analyse', ensureAuthenticated, function(req, res){
  User.findById(req.session.passport.user, function(err, user) {
    if (err){
      res.send(err);
      return;
  }

  if (user) {
      var FB = require('fb');
      FB.setAccessToken(user.token);

      FB.api('/'+req.body.id,'GET', function(resp) {
        if(!resp.messages) {
          res.send([]);
          return;
      }

      var data = [];
      var TARGET = 200;
      var count = 0;
      var anyLeft = true;
      var processing = 0, done = 0;

        function traverse(link) {
            request(link, function(err, headers, body) {
                if(err) return;
                
                 for (var i = 0; i < body.data.length; i++) {
                    count++;
                    data.push([body.data[i].created_time,sentiment(body.data[i].message).score]);

                    if(body.paging && body.paging.next) {
                      processing++;
                      traverse(r.paging.next);
                    }
                }
                done++;
            });

            if(count > TARGET || done == processing){
                console.log(data.length);
                return res.send([["Date", "Score"]].concat(data));
            }
        }

        for (var i = 0; i < resp.messages.data.length; i++) {
            count++;
            data.push([resp.messages.data[i].created_time,sentiment(resp.messages.data[i].message).score]);

            if(resp.messages.data && resp.messages.paging.next) {
                  processing++;
                  traverse(resp.messages.paging.next);
            }
        }
    });   
  }
});
});

app.use(router);
}

function ensureAuthenticated(req, res, next) {
   if (req.isAuthenticated() && req.session.passport.user) { return next(); }
   res.redirect('/');
}
