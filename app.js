var express = require("express");
var Yelp = require('yelp');
var business = require('./models/business.js');
var search = require('./models/search.js')
var user = require('./models/user.js')
var bodyParser = require("body-parser");
var config = require('./config.js');
var mongoose = require('mongoose');
var bar = require('./models/bar.js');
var request = require('request');
var fs = require("fs");
var http = require("http");
var router = express.Router();
module.exports = router;


if (!process.env.CONSUMER_KEY) {
    var env = require('./env.js')
}

var yelp = new Yelp({
        consumer_key: process.env.CONSUMER_KEY,
        consumer_secret: process.env.CONSUMER_SECRET,
        token: process.env.ACCESS_TOKEN_KEY,
        token_secret: process.env.ACCESS_TOKEN_SECRET
    })
    //ONLOAD OF APP
router.route('/')
    .get(function(req, res) {
        //If user is logged in...
        if (req.user) {
            user.findOne({ lastsearch: req.user.lastsearch }, function(err, c) {
                //If user has a search history
                if (c != null) {
                    if (c.lastsearch.length > 0) {
                        var current = c.lastsearch;
                        var userCity = current[0].city;
                        //see if there's an existing city with bar names:We're updating the total attending. 
                        bar.findOne({ city: userCity },
                            function(err, b) {
                                //if the city does exist...
                                if (b !== null) {
                                    //loop through the search we submitted and get bar names.....
                                    for (i = 0; i < current.length; i++) { //This loop uses our latest search
                                        var searchbarname = current[i].name;
                                        var barMatch = b.location;
                                        for (j = 0; j < barMatch.length; j++) { //This loop goes through our bar model db, searching for bar name matches. 
                                            var locabar = barMatch[j].bar;
                                            var locatotal = barMatch[j].total;
                                            //Match the bar names from our bar model to our search results and update the total where it applies
                                            if (searchbarname === locabar) {
                                                user.findOneAndUpdate({ '_id': req.user.id, 'lastsearch.name': locabar }, { '$set': { 'lastsearch.$.total': locatotal } }, function(err, u) {

                                                })
                                            }
                                        }
                                    }
                                    //If the length of our current search is the same length of our bar model...then we've completed both our loops and we're ready to render results
                                    if (i === current.length && j === barMatch.length) {
                                        //Query the user model and find the last search array we saved, we'll call our function and add the city name and searched array. 
                                        var queryList = user.where({ '_id': req.user.id });
                                        queryList.findOne(function(err, b) {
                                            userDataPage("city", b.lastsearch);
                                        });
                                    }
                                } else {
                                    //If there is no bar data stored, then total attending remains zero for all bars
                                    res.render("results", {
                                        title: "SEARCH PAGE :)",
                                        city: "city",
                                        searches: c.lastsearch
                                    });
                                    return;
                                }

                            })
                    } else {
                        //If the length of our last search is not greater than zero then render an empty array
                        res.render("results", {
                            title: "SEARCH PAGE :|",
                            city: "city",
                            searches: c.lastsearch
                        });
                        return;
                    }
                }
            })

        } else {
            //If not a logged in user, render an empty search to start 
            var blank = [];
            res.render("results", {
                title: "SEARCH PAGE",
                city: "city",
                searches: blank
            });
            return;
        };
        //If we called this function we are ready to display our results. 
        function userDataPage(c, results) {
            res.render("results", {
                title: "SEARCH PAGE :/",
                city: c,
                searches: results
            });
            return;

        }
    }) //SUBMISSION OF A SEARCH
    .post(function(req, res) {
        var city = req.body.city;
        yelp.search({ term: 'bar', location: city })
            .then(function(data) {
                var results = [];
                for (i = 0; i < 5; i++) {
                    var name = data.businesses[i].name;
                    var snippet = data.businesses[i].snippet_text;
                    var image = data.businesses[i].image_url;
                    var attending = "notgoing";
                    results.push({ "city": city, "name": name, "snippet": snippet, "image": image, "attending": attending, "total": 0 });
                }
                //If you are a logged in user..
                if (req.user) {
                    lastArray(results)
                        //we remove our last searched array data, clearing it out for your new search
                    function lastArray(results) {
                        user.findByIdAndUpdate(req.user._id, { $pull: { lastsearch: { $exists: true } } }, function(err, p) {
                            if (err) throw err;
                            getResults(results)
                        });
                    }
                    //we are pushing each of the objects from our yelp search into the lastsearch array. 
                    function getResults(results) {
                        user.findByIdAndUpdate(req.user._id, { $push: { lastsearch: { $each: results } } }, function(err, l) {
                            if (err) throw err;
                            doSomethingWithResults(results);
                        });
                    }
                    //After the lastsearch has entered...
                    function doSomethingWithResults(results) {
                        var bl = req.user.barlist;
                        //we begin looking through the results array that was created.
                        for (var i = 0; i < results.length; i++) {
                            //If the name of the bar in our results, match the names in our other user array called barlist....
                            var barN = results[i].name;
                            for (var j = 0; j < bl.length; j++) {
                                var userlist = req.user.barlist[j].name;
                                if (barN === userlist) {
                                    results[i].attending = "going";
                                    //we change our attendance from "notgoing" to "going" and set our total to 1, this will be utilized to change 'totals' and change the color of the button via JQuery. 
                                    user.findOneAndUpdate({ '_id': req.user.id, 'lastsearch.name': barN }, { '$set': { 'lastsearch.$.attending': "going", 'lastsearch.$.total': 1 } }, function(err, u) {})
                                };
                            };
                        };
                        // We then redirect back to our GET route....
                        barModelAttendanceResult(results);
                    }

                    function barModelAttendanceResult(results) {
                        var userCity = results[0].city;
                        var current = results
                            //see if there's an existing city with bar names:We're updating the total attending. 
                        bar.findOne({ city: userCity },
                            function(err, b) {
                                //if the city does exist...
                                if (b !== null) {
                                    //loop through the search we submitted and get bar names.....
                                    for (i = 0; i < current.length; i++) { //This loop uses our latest search
                                        var searchbarname = current[i].name;
                                        var barMatch = b.location; //this is the bar models array with bar names within it.  
                                        for (j = 0; j < barMatch.length; j++) { //This loop goes through our bar model db, searching for bar name matches. 
                                            var locabar = barMatch[j].bar;
                                            var locatotal = barMatch[j].total;
                                            //Match the bar names from our bar model to our search results and update the total where it applies
                                            if (searchbarname === locabar) {
                                                user.findOneAndUpdate({ '_id': req.user.id, 'lastsearch.name': locabar }, { '$set': { 'lastsearch.$.total': locatotal } }, function(err, u) {

                                                })
                                            }
                                        }
                                    }
                                }
                            });
                        res.redirect('/app');
                    }
                } else {
                    //This is the non-user results
                    res.render("results", {
                        city: city,
                        searches: results
                    });
                }
            })
            .catch(function(err) {
                console.error(err);
            });
    });
//AFTER BUTTON CLICK
router.get('/attend/:id', function(req, res) {
        //If a user is logged in...
        if (req.user) {
            //Loop the last search/rendered search from yelp...
            for (i = 0; i < req.user.lastsearch.length; i++) {
                //find the bar name that matches the bar name of the id parameter given to route...
                if (req.user.lastsearch[i].name === req.params.id) {
                    //Check the attendance, if the attendance is "notgoing"....
                    if (req.user.lastsearch[i].attending === "notgoing") {
                        var city = req.user.lastsearch[i].city;
                        var barN = req.user.lastsearch[i].name;
                        //Find the user ID and the bar name from this search then set attending to "going" and change the total to 1
                        //!!CAUTION, maybe change total to 1 if there is no bar model info to insert. 
                        user.findOneAndUpdate({ '_id': req.user.id, 'lastsearch.name': req.params.id }, { '$set': { 'lastsearch.$.attending': "going", 'lastsearch.$.total': 1 } }, function(err, user) {
                            if (err) throw err;
                        });
                        //Find the user module, push the bar name to the barlist inside the users schema
                        user.findByIdAndUpdate(req.user._id, { $push: { barlist: { "name": req.params.id, "rsvp": true } } }, function(err, use) {});
                        //Find the bar module and query for the city we searched for in that module...
                        var queryOne = bar.where({ 'city': city });
                        queryOne.findOne(function(err, b) {
                            //If no city is found then create the new city in the bar module...
                            if (b === null || b === undefined) {
                                var newBar = bar({
                                    "city": city,
                                    location: [{
                                        "bar": barN,
                                        "total": 1
                                    }]
                                });
                                newBar.save(function(err) {
                                    if (err) throw err;
                                });

                            } else {
                                //If the city is found, then look for the city AND the bar name in that city to see if it exists...
                                var queryTwo = bar.where({ 'city': city, 'location.bar': barN });
                                queryTwo.findOne(function(err, b) {
                                    //If the bar name does not exist, push that bar name into the city array.  
                                    if (b === null || b === undefined) {
                                        bar.findOneAndUpdate({ 'city': city }, { $push: { 'location': { 'bar': barN, 'total': 1 } } },
                                            function(err, user) {
                                                if (err) throw err;
                                            });
                                    } else {
                                        //If the bar name does exist in the City already, then increment the total + 1...
                                        bar.findOneAndUpdate({ 'city': city, 'location.bar': barN }, { '$inc': { 'location.$.total': 1 } },
                                            function(err, b) {


                                                for (i = 0; i < b.location.length; i++) {
                                                    if (b.location[i].bar === barN) {

                                                        //Then update the lastsearch bar name total to bar module total
                                                        var tota = b.location[i].total
                                                        var tota = tota + 1;
                                                        user.findOneAndUpdate({ '_id': req.user.id, 'lastsearch.name': barN }, { '$set': { 'lastsearch.$.total': tota } }, function(err, use) {
                                                            if (err) throw err;
                                                        });

                                                    }
                                                }


                                            });

                                    }
                                });
                            };

                        })
                        res.redirect('/app');
                    } else {
                        //IF WE CHOOSE TO NOT GO:  If we're here, then the attendance says that we are going, so we will change this to "not going"...
                        for (j = 0; j < req.user.lastsearch.length; j++) {
                            //find the bar name that matches the id parameter given to route...
                            if (req.user.lastsearch[j].name === req.params.id) {
                                if (req.user.lastsearch[j].attending === "going") {
                                    var city = req.user.lastsearch[j].city;
                                    var barN = req.user.lastsearch[j].name;
                                    //Find the user ID and the bar name from this search then set attending to "notgoing" and we subtract the total number going 
                                    user.findOneAndUpdate({ '_id': req.user.id, 'lastsearch.name': barN }, { '$set': { 'lastsearch.$.attending': "notgoing" } }, function(err, use) {
                                        if (err) throw err;
                                    });
                                    user.findByIdAndUpdate(req.user._id, { $pull: { barlist: { "name": barN, "rsvp": true } } }, function(err, use) {});
                                    bar.findOneAndUpdate({ 'city': city, 'location.bar': barN }, { '$inc': { 'location.$.total': -1 } },
                                        function(err, b) {
                                            for (var i in b.location) {
                                                if (b.location[i].bar === barN) {
                                                    user.findOneAndUpdate({ '_id': req.user.id, 'lastsearch.name': barN }, { '$inc': { 'lastsearch.$.total': -1 } }, function(err, use) {
                                                        if (err) throw err;
                                                    });
                                                }
                                            }
                                        })
                                }
                            }
                        }
                    }
                }
            }
            // res.redirect("/app");
        } else {
            res.redirect("/auth/login");
        }
    })
    .post('/attend', function(req, res) {})