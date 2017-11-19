var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');

var Campaign = require('../models/campaign');

router.get('/:id/:index', function(req, res, next) {
	var id = req.params["id"];
	var index = req.params["index"].slice(0, -4);;
	Campaign.findById(id, function (err, campaign) {
		if (err) return res.status(400).send({success: false});
		// campaign.anything = { x: [3, 4, { y: "changed" }] };
		// person.markModified('anything');
		// person.save();
		if (campaign.contacts[index]){
			campaign.contacts[index].seentimes++;
			campaign.markModified('contacts');
		}
		campaign.timesopen++;
        campaign.save(function (err) {
        	if (err) return res.status(400).send({success: false});
        });	
       	return res.status(200).send({success: true});
	});
});

module.exports = router;