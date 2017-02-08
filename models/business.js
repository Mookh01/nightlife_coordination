var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var businessSchema = new Schema({
    rating: String,
    mobile_url: String,
    rating_img_url: String,
    review_count: String,
    name: String,
    rating_img_url_small: String,
    url: String,
    phone: String,
    snippet_text: String,
    image_url: String,
    snippet_image_url: String,
    display_phone: String,
    rating_img_url_large: String,
    is_closed: Boolean,
    location: Object
});

var Business = mongoose.model('business', businessSchema);
module.exports = Business;


// var newBusiness = new Business();

// newBusiness.save(function(err) {
//     if (err) {
//         console.log("Error in Saving user: " + err);
//         throw err;
//     }
// });