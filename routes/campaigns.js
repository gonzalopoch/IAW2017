var express = require('express');
var router = express.Router();
var uuid = require('uuid/v4');
var nodemailer = require('nodemailer');

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

    res.json({success: true, msg: 'Campaña creada.'});

    var to_mailer = '';
    var str;
    campaign.contacts.forEach(function(element,i) {
      if (i == 0){
        to_mailer = element.mail;
      }else{
        str = element.mail
        to_mailer = to_mailer.concat(', '+str);
      }
    });

    var from_mailer = '"';
    from_mailer = from_mailer.concat(campaign.sender+'" <'+campaign.mail)

    let transporter = nodemailer.createTransport({
      service: 'gmail',
      secure: false,
      port: 25,
      auth: {
        user: campaign.mail,
        pass: campaign.mailpass,
      },
      tls: {
        rejectUnauthorized: false
      }
    });


    let HelperOptions = {
      from: from_mailer,
      to: to_mailer,
      subject: campaign.name,
      html: campaign.body
    };

    transporter.sendMail(HelperOptions, (error, info) =>{
      if(error){
        return console.log(error);
      }
      console.log("Mensaje enviado.");
      console.log(info);
    });
  }
});

module.exports = router;


