var express = require('express');
var router = express.Router();
var uuid = require('uuid/v4');

var contacts = [];
var contactsById = {};

var contact = {name: "name1", mail:"mail1@iaw.com", phone: "112332224", tag: "tag1", user: "user1"};
contact.id = uuid();
contacts.push(contact);
contactsById[contact.id] = contact;
contact = {name: "name2", mail:"mail2@iaw.com", phone: "145332224", tag: "tag1", user: "user"}
contact.id = uuid();
contacts.push(contact);
contactsById[contact.id] = contact;

contact = {name: "name3", mail:"mail3@iaw.com", phone: "145333324", tag: "tag1", user: "user"}
contact.id = uuid();
contacts.push(contact);
contactsById[contact.id] = contact;

router.put('/:id', function(req, res, next) {
  var updatedContact = req.body;
  var id = req.params["id"];    
  var contact = contactsById[id];
  if (contact) {
      contact.name = updatedContact.name;
      contact.mail = updatedContact.mail;
      contact.phone = updatedContact.phone;
      contact.tag = updatedContact.tag;
      res.status(200);
      res.json(contact);
  } else {
      res.status(404).send("not found");
  }
});


router.get('/', function(req, res, next) {
  res.status(200);
  res.json(contacts);
});

router.get('/:id', function(req, res, next) {
  var id = req.params["id"];    
  var contact = contactsById[id];
  if (contact) {
      res.status(200);
      res.json(contact);
  } else {
      res.status(404).send("not found");
  }
});

router.delete('/:id', function(req, res, next) {
  var id = req.params["id"];    
  var contact = contactsById[id];
  
  if (contact) {
      delete contactsById[id];
      contacts.splice(contacts.indexOf(contact), 1);
      res.status(200);
      res.json(contact);
  } else {
      res.status(404).send("not found");
  }
  
});


router.post('/', function(req, res, next) {
  if( !req.body.name || !req.body.user || !req.body.mail) {
    return res.json({success: false, msg: 'Ingrese usuario, remitente y nombre.'});
  }else{
    var contact = req.body;
    contact.id = uuid();
    contacts.push(contact);
    contactsById[contact.id] = contact;
    res.status(201);
    res.send(contact);
    res.json({success: true, msg: 'Usuario creada.'});
  }
});

module.exports = router;
