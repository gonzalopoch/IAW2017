var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model
var CampaignSchema = new Schema({
  name: {
        type: String,
        required: true
    },
  body: {
        type: String,
        required: true
    },
  date: {
        type: String,
        required: true
    },
  time: {
        type: String,
        required: true
    },
  sender: {
        type: String,
        required: true
    },
  mail: {
        type: String,
        required: true
    },
  mailpass: {
        type: String,
        required: true
    },
  timesopen: {
        type: Number,
        required: true
    },
  user: {
        type: String,
        required: true
    },
  contacts: {
    }
});

module.exports = mongoose.model('Campaign', CampaignSchema);