var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');

var Campaign = require('../models/campaign');
var User = require('../models/user');

var passport   = require('passport');
var jwt        = require('jwt-simple');
var config = require('../config/database'); // get db config file


// var campaigns = [];
// var campaignsById = {};

// var campaign = {name: "name1", body:"lorem ipsum blabla", date:"05/10/2017", time: "13:30:00", mail: "mail1@iaw.com", timesopen: "5", user: "user1"};
// campaign.id = uuid();
// campaigns.push(campaign);
// campaignsById[campaign.id] = campaign;
// campaign = {name: "name2", body:"lorem ipsum lalala", date:"06/10/2017", time:"12:00:00", mail: "mail2@iaw.com", timesopen: "3", user: "user"};
// campaign.id = uuid();
// campaigns.push(campaign);
// campaignsById[campaign.id] = campaign;

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
            Campaign.find({user: decoded.name}, function(err, campaigns) {
              return res.status(200).json(campaigns);  
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

// router.get('/', function(req, res, next) {
//   Campaign.find({}, function(err, campaigns) {
//     res.status(200);
//     res.json(campaigns);  
//   });
// });

router.get('/:id', function(req, res, next) {
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
            Campaign.findOne({
              _id: id
            }, function(err, campaign) {
              if (err) throw err;
              if (campaign.user != decoded.name) return res.status(401).json({success: false, msg: 'No puedes ver esta campaña.'});
              if (!campaign) {
                return res.status(404).send({success: false, msg: 'Campaign not found.'});
              } else {
                return res.status(200).json(campaign);
              }
            });
        }
    });
  } else {
    return res.status(403).send({success: false, msg: 'No token provided.'});
  }    
});

router.delete('/:id', passport.authenticate('jwt', { session: false}), function(req, res) {
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
            Campaign.findById(id, function (err, campaign) {
              if (err) return res.status(400).json({success: false, msg: 'Error al eliminar campaña.'});
              if (campaign.user != decoded.name) return res.status(401).json({success: false, msg: 'No puedes eliminar esta campaña.'});
                campaign.remove(function (err) {
                  if (err) return res.status(400).send({success: false, msg: 'Campaign not erased.'});
                  return res.status(200).send({success: true, msg: 'Campaign erased.'});
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
            if( !req.body.name || !req.body.sender) {
              return res.status(400).json({success: false, msg: 'Ingrese usuario, remitente y nombre.'});
            }else{
              var newCampaign = new Campaign(req.body);
              newCampaign.user = decoded.name;
              newCampaign.mail = decoded.mail;
              newCampaign.mailpass = decoded.mailpass;
              let transporter = nodemailer.createTransport({
                service: 'gmail',
                secure: false,
                port: 25,
                auth: {
                  user: newCampaign.mail,
                  pass: newCampaign.mailpass,
                },
                tls: {
                  rejectUnauthorized: false
                }
              });

              var from_mailer = '"';
              from_mailer = from_mailer.concat(newCampaign.sender+'" <'+newCampaign.mail)
              var mails_sent = 0;
              var thisid;
              newCampaign.save(function(err,camp) {
                if (err) {
                  return res.status(400).json({success: false, msg: 'Error al (pre)crear campaña.'});
                }
                thisid = camp._id;
                newCampaign.contacts.forEach(function(element,i) {
                  var reques = '<img src="http://localhost:3000/api/v1/track/'+thisid+'/'+mails_sent+'.png" width="1" height="1">';
                  // ACA VA LA REQUEST HAY QUE VER COMO HACERLA
                  let HelperOptions = {
                    from: from_mailer,
                    to: element.mail,
                    subject: newCampaign.name,
                    html: reques.concat(newCampaign.body)
                  };
                  transporter.sendMail(HelperOptions, (error, info) =>{
                    mails_sent++;
                    if(error){
                      newCampaign.contacts[i].state = false;
                      console.log(error);
                    }else{
                      if (info.accepted.length > 0){
                        newCampaign.contacts[i].state = true;
                      } else {
                        newCampaign.contacts[i].state = false;
                      }
                      console.log("Mensaje enviado.");
                      console.log(info);
                    }
                    if (mails_sent == newCampaign.contacts.length){
                      Campaign.findById(thisid, function (err, campaign) {
                        if (err) return res.status(400).json({success: false, msg: 'Error al actualizar campaña.'});
                        campaign.contacts = newCampaign.contacts;
                        campaign.save(function (err) {
                          if (err) return res.status(400).json({success: false, msg: 'Error al actualizar campaña.'});
                          res.status(201).json({success: true, msg: 'Campaña creada.', id: thisid});
                        });
                      });
                    }      
                  });
                });
              });
            }
        }
    });
  } else {
    return res.status(403).send({success: false, msg: 'No token provided.'});
  }
});

module.exports = router;


