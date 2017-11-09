var JwtStrategy = require('passport-jwt').Strategy;
 
// load up the user model
var Users = require('../routes/users');
var config = require('../config/database'); // get db config file
 
module.exports = function(passport) {
  var opts = {};
  opts.secretOrKey = config.secret;
  passport.use(new JwtStrategy(opts, function(jwt_payload, done) {

    var indx = Users.users.map(function(el) {
      return el.id;
    }).indexOf(jwt_payload.id);

    if( indx !== -1 ) {
      user = Users.users[indx];
      done(null, user)
    }else{
      done(null, false);
    }
  }));
};