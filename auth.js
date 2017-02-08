var express = require("express");
var router = express.Router();
var User = require("./models/user.js");
var flash = require("connect-flash");
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;


router.get('/signup', function(req, res) {
    res.render('signup');
});
router.post('/signup', function(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;

    //Validation
    req.checkBody('username', 'username is required').notEmpty();
    req.checkBody('password', 'password is required').notEmpty();
    req.checkBody('password2', 'password2 is required').equals(req.body.password);
    var errors = req.validationErrors();

    User.find({ 'username': username }, function(err, user) {
        if (err) {

            console.log('Signup error');
            return done(err);
        };

        if (user.length != 0) {
            if (user[0].username) {
                console.log('Username already exists, username: ' + username);
                req.flash('error_msg', "Username or Password already exists");
                return res.redirect('/auth/signup');
            } else {
                var err = new Error();
                err.status = 310;
                return done(err);
            }
        } else {
            var newUser = new User({
                username: username,
                password: password
            });
            User.createUser(newUser, function(err, user) {
                if (err) throw err;
            });

            req.flash('success_msg', "You're signed up, Please Login");
            return res.redirect('/auth/login');
        }
    });
});
//LOGIN
router.get("/login", function(req, res) {
    res.render("login");
});

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(id, done) {
    User.getUserById(id, function(err, user) {
        done(err, user);
    });
});

passport.use(new LocalStrategy(
    function(username, password, done) {
        User.getUserByUsername(username, function(err, user) {
            if (err) throw err;
            if (!user) {
                return done(null, false, { message: 'Unknown User, Please Register If You Have Not Already Done So' });
            }

            User.comparePassword(password, user.password, function(err, isMatch) {
                if (err) throw err;
                if (isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false, { message: 'Invalid password' });
                }
            });
        });
    }));

router.post("/login", passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/auth/login',
        failureFlash: true
    }),
    function(req, res) {
        res.redirect('/');
    });

//LOGOUT
router.get('/logout', function(req, res) {
    req.logout();
    req.flash('success_msg', 'Your Are Logged Out');
    res.redirect('/auth/login')
});

module.exports = router;