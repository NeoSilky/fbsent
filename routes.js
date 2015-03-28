var User          = require('./user.js');
var sentiment = require('sentiment');

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

  router.get('/getData', function(req, res) {
    var array = {
      titles: ["Date", "Score"],
      data:[
        ["Date", "Score"],
        ["23/02",2],
        ["25/02",1],
        ["28/02",6]
      ]
    };

    for(var i = 0; i < 10;i++) {
      array.data.push([i+"/02", i]);
    }
    res.send(array);
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

  router.post('/analysis', ensureAuthenticated, function(req, res){
    User.findById(req.session.passport.user, function(err, user) {
      if (err){
        res.send(err);
        return;
      }

      if (user) {
        var FB = require('fb');
        FB.setAccessToken(user.token);

        FB.api('/'+req.body.id,'GET',function(r) {
          var array       =   "";
          for (var i = 0; i < r.messages.data.length; i++) { 
              array += r.messages.data[i].message + " ";
          }
          var r1 = sentiment(array);
          res.send(r1);
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
    res.redirect("/download.html");
  });

  app.use(router);
}

function ensureAuthenticated(req, res, next) {
  	if (req.isAuthenticated()) { return next(); }
  	res.redirect('/');
}
