var express = require('express');
var router = express.Router();
var uuid = require('uuid/v4');
var bcrypt = require('bcryptjs');

var passport   = require('passport');
var jwt        = require('jwt-simple');

var User = require('../models/user');

require('../config/passport')(passport);

var config = require('../config/database'); // get db config file

// var users = [];
// exports.users = users;
// var usersById = {};



// var user = {username: "user", mail:"ingappw2017@gmail.com"};
// user.id = uuid();
// // bcrypt.genSalt(10, function(err, salt) {                     //
// //     bcrypt.hash('2017ingappw', salt, function(err, hash) {  //
// //         user.mailpass = hash;                              // Guardo contraseña mail
// //     });                                                   // encriptada
// // }); 
// user.mailpass = '2017ingappw';                                                     //
// bcrypt.genSalt(10, function(err, salt) {                   //
//     bcrypt.hash('password', salt, function(err, hash) {   //
//         user.password = hash;                            // Guardo contraseña user
//     });                                                 // encriptada
// });                                                    //
// users.push(user);
// usersById[user.id] = user;


// var user1 = {username: "user1", mail:"ingappw2017@gmail.com"};
// user1.id = uuid();
// bcrypt.genSalt(10, function(err, salt) {                     //
//     bcrypt.hash('2017ingappw', salt, function(err, hash) {  //
//         user1.mailpass = hash;                              // Guardo contraseña mail
//     });                                                   // encriptada
// });                                                      //
// bcrypt.genSalt(10, function(err, salt) {                   //
//     bcrypt.hash('password', salt, function(err, hash) {   //
//         user1.password = hash;                            // Guardo contraseña user
//     });                                                 // encriptada
// });                                                    //
// users.push(user1);
// usersById[user1.id] = user1;

 
// getToken = function (headers) {
//   if (headers && headers.authorization) {
//     var parted = headers.authorization.split(' ');
//     if (parted.length === 2) {
//       return parted[1];
//     } else {
//       return null;
//     }
//   } else {
//     return null;
//   }
// };

// router.get('/', function(req, res, next) {
//   res.status(200);
//   res.json(users);
// });

// router.get('/memberid', passport.authenticate('jwt', { session: false}), function(req, res) {
//   var token = getToken(req.headers);
//   if (token) {
//     var decoded = jwt.decode(token, config.secret);

//     if( users.map(function(el) {
//       return el.id;
//     }).indexOf(decoded.id) !== -1 ) {
//       res.json(decoded);
//     }else{
//       return res.status(403).send({success: false, msg: 'Authentication failed. User not found.'});
//     }
//   } else {
//     return res.status(403).send({success: false, msg: 'No token provided.'});
//   }
// });

// router.get('/memberinfo', passport.authenticate('jwt', { session: false}), function(req, res) {
//   var token = getToken(req.headers);
//   if (token) {
//     var decoded = jwt.decode(token, config.secret);

//     if( users.map(function(el) {
//       return el.username;
//     }).indexOf(decoded.username) !== -1 ) {
//       res.json({success: true, msg: 'Welcome in the member area ' + user.username + '!'});
//     }else{
//       return res.status(403).send({success: false, msg: 'Authentication failed. User not found.'});
//     }
//   } else {
//     return res.status(403).send({success: false, msg: 'No token provided.'});
//   }
// });

// router.get('/:id', function(req, res, next) {
//   var id = req.params["id"];    
//   var user = usersById[id];
//   if (user) {
//       res.status(200);
//       res.json(user);
//   } else {
//       res.status(404).send("not found");
//   }
// });

// router.post('/', function(req, res, next) {
//   var user = req.body;
//   user.id = uuid();
//   users.push(user);
//   usersById[user.id] = user;
//   res.status(201);
//   res.send(user);
// });

// route to a restricted info (GET http://localhost:8080/api/memberinfo)
router.get('/memberid', passport.authenticate('jwt', { session: false}), function(req, res) {
  var token = getToken(req.headers);
  if (token) {
    var decoded = jwt.decode(token, config.secret);
    User.findOne({
      username: decoded.username
    }, function(err, user) {
        if (err) throw err;
 
        if (!user) {
          return res.status(403).send({success: false, msg: 'Authentication failed. User not found.'});
        } else {
          res.json(decoded);
        }
    });
  } else {
    return res.status(403).send({success: false, msg: 'No token provided.'});
  }
});
 
getToken = function (headers) {
  if (headers && headers.authorization) {
    var parted = headers.authorization.split(' ');
    if (parted.length === 2) {
      return parted[1];
    } else {
      return null;
    }
  } else {
    return null;
  }
};

router.put('/edit', function(req, res, next) {
  var updatedUser = req.body;
  var token = getToken(req.headers);
  if (token) {
    var decoded = jwt.decode(token, config.secret);
    User.findOne({
      username: decoded.username
    }, function(err, user) {
        if (err) throw err;
 
        if (!user) {
          return res.status(403).send({success: false, msg: 'User not found.'});
        } else {
          user.comparePassword(req.body.password, function (err, isMatch) {
            if (isMatch && !err) {
              user.name = req.body.name;
              user.lastname = req.body.lastname;
              user.mail = req.body.mail;
              user.mailpass = req.body.mailpass;
              user.save(function (err) {
                if (err) return res.status(400).json({success: false, msg: 'Error al actualizar usuerio.'});
                res.status(200).json({success: true, msg: 'Información de usuario actualizada.'});
              });
            } else {
              res.status(403).send({success: false, msg: 'Contraseña incorrecta.'});
            }
          });  
        }
    });
  } else {
    return res.status(403).send({success: false, msg: 'No token provided.'});
  }
});

// create a new user account (POST http://localhost:8080/api/signup)
router.post('/signup', function(req, res) {
  if (!req.body.username || !req.body.password || !req.body.mail || !req.body.mailpass) {
    res.json({success: false, msg: 'Please pass name and password.'});
  } else {
    var newUser = new User({
      username: req.body.username,
      password: req.body.password,
      name: req.body.name,
      lastname: req.body.lastname,
      mail: req.body.mail,
      mailpass: req.body.mailpass
    });
    // save the user
    newUser.save(function(err) {
      if (err) {
        return res.json({success: false, msg: 'Username already exists.'});
      }
      res.json({success: true, msg: 'Successfully created new user.'});
    });
  }
});

// route to authenticate a user (POST http://localhost:8080/api/authenticate)
router.post('/authenticate', function(req, res) {
  User.findOne({
    username: req.body.username
  }, function(err, user) {
    if (err) throw err;
 
    if (!user) {
      res.send({success: false, msg: 'Authentication failed. User not found.'});
    } else {
      // check if password matches
      user.comparePassword(req.body.password, function (err, isMatch) {
        if (isMatch && !err) {
          // if user is found and password is right create a token
          var token = jwt.encode(user, config.secret);
          // return the information including token as JSON
          res.json({success: true, token: 'JWT ' + token});
        } else {
          res.send({success: false, msg: 'Authentication failed. Wrong password.'});
        }
      });
    }
  });
});

// router.post('/signup', function(req, res) {
//   if( users.map(function(el) {
//     return el.username;
//   }).indexOf(req.body.username) !== -1 ) {
//     return res.json({success: false, msg: 'Nombre de usuario ya existente.'});
//   }else{
//     var newUser = {
//       username: req.body.username,
//       name: req.body.name,
//       lastname: req.body.lastname,
//       mail: req.body.mail,
//       mailpass: req.body.mailpass,
//     };
//     newUser.id = uuid();
//     bcrypt.genSalt(10, function(err, salt) {                   
//         bcrypt.hash(req.body.password, salt, function(err, hash) {   
//             newUser.password = hash;
//         });
//     });  
//     // save the user 
//     users.push(newUser);
//     usersById[newUser.id] = newUser;
//     res.json({success: true, msg: 'Usuario creado.'});
//   }
// });



// router.post('/authenticate', function(req, res) {
//   var indx = users.map(function(el) {
//     return el.username;
//   }).indexOf(req.body.username);

//   if( indx !== -1 ) {
//     user = users[indx];
//     bcrypt.compare(req.body.password, user.password, function(err, isMatch) {
//       if (isMatch && !err){
//         // if user is found and password is right create a token
//         var token = jwt.encode(user, config.secret);
//         // return the information including token as JSON
//         res.json({success: true, token: 'JWT ' + token});
//       }else{
//         res.send({success: false, msg: 'Fallo en la autenticación. Contraseña incorrecta.'});
//       }
//     });
//   }else{
//     res.send({success: false, msg: 'Fallo en la autenticación. Usuario no encontrado.'});
//   }
// });


module.exports = router;
