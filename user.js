var mongoose = require('mongoose');

var User = mongoose.model('User', {
  oauthID: String,
  name: String,
  token: String,
  created: Date
});

module.exports = User;