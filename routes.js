var User          = require('./user.js');
var sentiment = require('sentiment');
var request = require('request');

module.exports = function(express, app, passport) {
  var router = express.Router();

  router.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
  });

  router.get('/auth', passport.authenticate('facebook',  { scope: 'read_mailbox' }));

  router.get('/auth/callback', passport.authenticate('facebook', { 
  	successRedirect: '/account',
    failureRedirect: '/failed',
    scope: 'read_mailbox'
  }));

  router.get('/failed', function(req, res) {
  	console.log("Failed to authenticate.");
  	res.redirect('/');
  });

  router.get('/unlink', ensureAuthenticated, function(req, res) {
    var user            = req.user;
    user.token = undefined;
    user.save(function(err) {
      res.redirect('/account');
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

        FB.api('/me/threads', 'GET', {fields: 'id,message_count,updated_time,participants'}, function(r) {
          var text=[];

          for (var i = 0; i < r.data.length; i++) { 
            if(r.data[i].participants.data.length > 2) continue;

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

      FB.api('/'+req.body.id,'GET',function(r) {

        if(!r.messages) {
          res.send([]);
          return;
        }
        var array       =   "";
        var data = [["Date", "Score"]];
        var next = "";

    /*    if(r.paging && r.paging.next) {
          request(r.paging.next, function (error, response, body) {
            if (!error && response.statusCode == 200) {
              console.log(body); 
            }
          });
        }
*/
//        for(var times = 0; times < 5; times++) {
          for (var i = 0; i < r.messages.data.length; i++) { 
            array += r.messages.data[i].message + " ";
            data.push([new Date(r.messages.data[i].created_time).toDateString(),sentiment(r.messages.data[i].message).score]);
          }
  //      }
        res.send(data);
        });   
        }
  });
});

router.get('/account', ensureAuthenticated, function(req, res){
  User.findById(req.session.passport.user, function(err, user) {
    if(err) { 
     console.log(err); 
     res.redirect("failed.html");
     return;
   }
 });
  res.redirect("/step2");
});

app.use(router);
}

function ensureAuthenticated(req, res, next) {
 if (req.isAuthenticated() && req.session.passport.user) { return next(); }
 res.redirect('/');
}
