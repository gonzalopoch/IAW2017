var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var contacts = require('./routes/contacts');
var campaigns = require('./routes/campaigns');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser())

app.use('/api/v1/contacts', contacts);

app.use('/api/v1/campaigns', campaigns);

app.use(express.static('public'));

app.use('/scripts', express.static(__dirname + '/node_modules/'));


module.exports = app;
