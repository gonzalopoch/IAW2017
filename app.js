var express      = require('express');
var path         = require('path');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');

var passport	 = require('passport');
var jwt          = require('jwt-simple');

var config       = require('./config/database'); // get db config file

var users        = require ('./routes/users');
var contacts     = require('./routes/contacts');
var campaigns    = require('./routes/campaigns');
var track    = require('./routes/track');

var morgan       = require('morgan');
var mongoose     = require('mongoose');




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

app.use('/api/v1/track', track);

app.use('/api/v1/users', users);

app.use(express.static('public'));

app.use('/scripts', express.static(__dirname + '/node_modules/'));

// connect to database
// mongoose.connect(config.database, {
//   useMongoClient: true,
//   /* other options */
// });

mongoose.connect(config.database);

module.exports = app;


