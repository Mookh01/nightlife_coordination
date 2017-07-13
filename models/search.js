var mongoose = require('mongoose');

//USER SCHEMA
var Schema = mongoose.Schema;
var searchSchema = new Schema({
    city: String,
    attending: String,
    crowd: String,
});

var Search = mongoose.model('Search', searchSchema);
module.exports = Search;