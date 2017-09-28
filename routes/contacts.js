var express = require('express');
var router = express.Router();
var uuid = require('uuid/v4');

var contacts = []
var contactsById = {};

router.put('/:id', function(req, res, next) {
  var updatedContact = req.body;
  
  var id = req.params["id"];    
  var contact = contactsById[id];
  if (contact) {
      contact.name = updatedContact.name;
      res.json(contact);
  } else {
      res.status(404).send("not found");
  }
});


router.get('/', function(req, res, next) {
  res.json(contacts);
});

router.get('/:id', function(req, res, next) {
  var id = req.params["id"];    
  var contact = contactsById[id];
  if (contact) {
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
      contacts.splice(contacts.indexOf(contact), 1)
      res.json(contact);
  } else {
      res.status(404).send("not found");
  }
  
});


router.post('/', function(req, res, next) {
  var contact = req.body;
  contact.id = uuid();
  contacts.push(contact);
  contactsById[contact.id] = contact;
  res.send(contact);
});

module.exports = router;
