const passport = require("passport");

//Add object models
const User = require("../models/User");

//Object that will contain all routing functions
const userController = {};

// Go to registration page
userController.register = function(req, res) {
  res.render('register');
};

// Post registration
userController.doRegister = function(req, res) {
  User.register(new User({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    username : req.body.username}), req.body.password, function(err, user) {
    if (err) {
      console.log(err);
      return res.render('register', { user : user , error: err["message"]});
    }
    passport.authenticate('local')(req, res, function () {
      res.redirect('/');
    });
  });
};

// Go to login page
userController.login = function(req, res) {
  res.render('login');
};

// Post login
userController.doLogin =
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: "Incorrect username or password"
  });

// logout
userController.logout = function(req, res) {
  req.logout();
  res.redirect('/');
};


module.exports = userController;
