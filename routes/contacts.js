var express = require('express');
var router = express.Router();
var uuid = require('uuid/v4');

var Contact = require('../models/contact');
var User = require('../models/user');

var passport   = require('passport');
var jwt        = require('jwt-simple');
var config = require('../config/database'); // get db config file

// var contacts = [];
// var contactsById = {};

// var contact = {name: "name1", mail:"mail1@iaw.com", phone: "112332224", tag: "tag1", user: "user1"};
// contact.id = uuid();
// contacts.push(contact);
// contactsById[contact.id] = contact;
// contact = {name: "name2", mail:"gonzalopoch@hotmail.com", phone: "145332224", tag: "tag1", user: "user"}
// contact.id = uuid();
// contacts.push(contact);
// contactsById[contact.id] = contact;

// contact = {name: "name3", mail:"macuduranti@gmail.com", phone: "145333324", tag: "tag1", user: "user"}
// contact.id = uuid();
// contacts.push(contact);
// contactsById[contact.id] = contact;

router.put('/:id', function(req, res, next) {
  var id = req.params["id"];
  var updatedContact = req.body;
  var token = getToken(req.headers);
  if (token) {
    var decoded = jwt.decode(token, config.secret);
    User.findOne({
      name: decoded.name
    }, function(err, user) {
        if (err) throw err;
 
        if (!user) {
          return res.status(403).send({success: false, msg: 'User not found.'});
        } else {
            Contact.findById(id, function (err, contact) {
              if (err) return res.status(400).json({success: false, msg: 'Error al actualizar contacto.'});
              if (contact.user != decoded.name) return res.status(401).json({success: false, msg: 'Error al actualizar contacto.'});
              contact.name = updatedContact.name;
              contact.mail = updatedContact.mail;
              contact.phone = updatedContact.phone;
              contact.tag = updatedContact.tag;
              contact.save(function (err) {
                if (err) return res.status(400).json({success: false, msg: 'Error al actualizar contacto.'});
                res.status(200).json({success: true, msg: 'Contacto creado.'});
              });
            });
        }
    });
  } else {
    return res.status(403).send({success: false, msg: 'No token provided.'});
  }
});


router.get('/', passport.authenticate('jwt', { session: false}), function(req, res) {
  var token = getToken(req.headers);
  if (token) {
    var decoded = jwt.decode(token, config.secret);
    User.findOne({
      name: decoded.name
    }, function(err, user) {
        if (err) throw err;
 
        if (!user) {
          return res.status(403).send({success: false, msg: 'User not found.'});
        } else {
            Contact.find({user: decoded.name}, function(err, contacts) {
              res.status(200);
              res.json(contacts);  
            });
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

// router.get('/:id', function(req, res, next) {
//   var id = req.params["id"];    
//   var contact = contactsById[id];
//   if (contact) {
//       res.status(200);
//       res.json(contact);
//   } else {
//       res.status(404).send("not found");
//   }
// });

router.delete('/:id', function(req, res, next) {

  var id = req.params["id"];   
  var token = getToken(req.headers);
  if (token) {
    var decoded = jwt.decode(token, config.secret);
    User.findOne({
      name: decoded.name
    }, function(err, user) {
        if (err) throw err;
 
        if (!user) {
          return res.status(403).send({success: false, msg: 'User not found.'});
        } else {
            Contact.findById(id, function (err, contact) {
              if (err) return res.status(400).json({success: false, msg: 'Error al eliminar contacto.'});
              if (contact.user != decoded.name) return res.status(401).json({success: false, msg: 'Error al eliminar contacto.'});
                contact.remove(function (err) {
                  if (err) return res.status(400).send({success: false, msg: 'Contact not erased.'});
                  return res.status(200).send({success: true, msg: 'Contact erased.'});
              });
            });
        }
    });
  } else {
    return res.status(403).send({success: false, msg: 'No token provided.'});
  }
  
});


router.post('/', function(req, res) {  
  var token = getToken(req.headers);
  if (token) {
    var decoded = jwt.decode(token, config.secret);
    User.findOne({
      name: decoded.name
    }, function(err, user) {
        if (err) throw err;
 
        if (!user) {
          return res.status(403).send({success: false, msg: 'User not found.'});
        } else {
            if( !req.body.name || !req.body.mail) {
              return res.status(400).json({success: false, msg: 'Ingrese remitente y nombre.'});
            }else{
              var newContact = new Contact(req.body);  
              newContact.user = decoded.name;
              newContact.save(function(err) {
                if (err) {
                  return res.status(400).json({success: false, msg: 'Error al crear contacto.'});
                }
                res.status(201).json({success: true, msg: 'Contacto creado.'});
              });
            }
        }
    });
  } else {
    return res.status(403).send({success: false, msg: 'No token provided.'});
  }
  
});

module.exports = router;
