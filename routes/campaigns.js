var express = require('express');
var router = express.Router();
var uuid = require('uuid/v4');

var campaigns = [];
var campaignsById = {};

var campaign = {name: "name1", body:"lorem ipsum blabla", date:"05/10/2017", time: "13:30:00", mail: "mail1@iaw.com", timesopen: "5", user: "user1"};
campaign.id = uuid();
campaigns.push(campaign);
campaignsById[campaign.id] = campaign;
campaign = {name: "name2", body:"lorem ipsum lalala", date:"06/10/2017", time:"12:00:00", mail: "mail2@iaw.com", timesopen: "3", user: "user"};
campaign.id = uuid();
campaigns.push(campaign);
campaignsById[campaign.id] = campaign;

router.get('/', function(req, res, next) {
  res.status(200);
  res.json(campaigns);
});

router.get('/:id', function(req, res, next) {
  var id = req.params["id"];    
  var campaign = campaignsById[id];
  if (campaign) {
      res.status(200);
      res.json(campaign);
  } else {
      res.status(404).send("not found");
  }
});

router.delete('/:id', function(req, res, next) {
  var id = req.params["id"];    
  var campaign = campaignsById[id];
  
  if (campaign) {
      delete campaignsById[id];
      campaigns.splice(campaigns.indexOf(campaign), 1)
      res.status(200);
      res.json(campaign);
  } else {
      res.status(404).send("not found");
  }
  
});


router.post('/', function(req, res, next) {

  if( !req.body.name || !req.body.user || !req.body.mail) {
    return res.json({success: false, msg: 'Ingrese usuario, remitente y nombre.'});
  }else{
    var campaign = req.body;
    campaign.id = uuid();
    campaigns.push(campaign);
    campaignsById[campaign.id] = campaign;
    res.status(201);
    res.send(campaign);
    res.json({success: true, msg: 'Campaña creada.'});
  }
});

module.exports = router;
