var express      = require('express');
var path         = require('path');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');

var passport	 = require('passport');
var jwt          = require('jwt-simple');

var config       = require('./config/database'); // get db config file

var Users        = require ('./routes/users');
var User         = require('./models/user');
var contacts     = require('./routes/contacts');
var campaigns    = require('./routes/campaigns');

var morgan       = require('morgan');
var mongoose     = require('mongoose');
// var config      = require('./config/database'); // get db config file
// var User        = require('./app/models/user'); // get the mongoose model




var app = express();

// get our request parameters
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cookieParser())

// log to console
app.use(morgan('dev'));

app.use(passport.initialize());

app.use('/api/v1/contacts', contacts);

app.use('/api/v1/campaigns', campaigns);

app.use('/api/v1/users', Users);

app.use(express.static('public'));

app.use('/scripts', express.static(__dirname + '/node_modules/'));

// connect to database
mongoose.connect(config.database);

module.exports = app;


