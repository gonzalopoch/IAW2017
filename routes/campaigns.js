var express = require('express');
var router = express.Router();
var uuid = require('uuid/v4');

var campaigns = [];
var campaignsById = {};

var campaign = {name: "name1", body:"lorem ipsum blabla", date:"05/10/2017", mail: "mail1@iaw.com", timesopen: "5"};
campaign.id = uuid();
campaigns.push(campaign);
campaignsById[campaign.id] = campaign;
campaign = {name: "name2", body:"lorem ipsum lalala", date:"06/10/2017", mail: "mail2@iaw.com", timesopen: "3"};
campaign.id = uuid();
campaigns.push(campaign);
campaignsById[campaign.id] = campaign;

router.get('/', function(req, res, next) {
  res.json(campaigns);
});

router.get('/:id', function(req, res, next) {
  var id = req.params["id"];    
  var campaign = campaignsById[id];
  if (campaign) {
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
      res.json(campaign);
  } else {
      res.status(404).send("not found");
  }
  
});


router.post('/', function(req, res, next) {
  var campaign = req.body;
  campaign.id = uuid();
  campaigns.push(campaign);
  campaignsById[campaign.id] = campaign;
  res.send(campaign);
});

module.exports = router;
