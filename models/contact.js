var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model
var ContactSchema = new Schema({
  name: {
        type: String,
        required: true
    },
  mail: {
        type: String,
        required: true
    },
  phone: {
      type: String
    }, 
  tag: {
      type: String
    },
  user: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Contact', ContactSchema);