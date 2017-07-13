var mongoose = require('mongoose');

//USER SCHEMA
var Schema = mongoose.Schema;
var barSchema = new Schema({
    city: String,
    location: [{
        bar: String,
        total: Number
    }]
});

var Bar = mongoose.model('Bar', barSchema);
module.exports = Bar;