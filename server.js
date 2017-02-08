var expressValidator = require('express-validator');
var express = require("express");
var path = require("path");
var cookieParser = require('cookie-parser');
var session = require('express-session');
var app = express();
var bodyParser = require("body-parser");
var Localstrategy = require('passport-local').Strategy;
var passport = require("passport");
var mongoose = require('mongoose');
var config = require('./config');
var bar = require('./models/bar.js');
var Yelp = require('yelp');
var business = require('./models/business.js');
var user = require('./models/user.js');
mongoose.connect(process.env.MONGODB_URI || 'mongodb://' + config.db.host + '/' + config.db.name);
var Schema = mongoose.Schema;
mongoose.Promise = global.Promise;

//CONNECT FLASH
var flash = require('connect-flash');


//VIEW ENGINE
app.set("views", "./views");
app.set("view engine", "jade");
app.use(express.static('public'));
app.use(express.static('node_modules/bootstrap/dist'));
app.use(express.static('node_modules/jade-bootstrap/components'));
app.use(express.static('node_modules/jquery/dist'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cookieParser());
//EXPRESS SESSIONS
app.use(require('express-session')({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
}));

//PASSPORT INIT
app.use(passport.initialize());
app.use(passport.session());

//EXPRESS VALIDATOR
app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.'),
            root = namespace.shift(),
            formParam = root;
        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    }
}));

app.use(flash());

//GLOBAL VARIABLES
app.use(function(req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});

//ROUTES
app.get('/', function(req, res) {
    res.render("home", { title: "Home" });
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect('/auth/login');
    }
}
var authRouter = require("./auth");
app.use('/auth', authRouter);

var appRouter = require("./app");
app.use('/app', appRouter);
app.set('port', (process.env.PORT || 7900))
app.listen(app.get('port'), function() {
    console.log("Program Running On port ", app.get('port'))
});