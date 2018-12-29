//Add object models
const User = require("../models/User");
const Game = require("../models/Game").Game;
const platforms = require("../models/Game").platforms;
const genres = require("../models/Game").genres;

//Object that will contain all routing functions
const gameController = {};

//Home page
gameController.home = function(req, res) {
  //Get dictionary of game filter options
  console.log("Query = " + req.query.mine);
  let username;
  const tempFilters = {"title": req.query.title, "genre": req.query.genre, "platform": req.query.platform};

  //If user only wants to see their games
  if (req.user && req.query.mine === "mine") {
    username = req.user.username;
  }
  //Otherwise, only show games marked public
  else {
    username = req.query.username;
    tempFilters["privacy"] = "public";
  }
  tempFilters["user"] = username;

  //Remove undefined or blank filter options
  const filters = Object.keys(tempFilters).reduce((filters, query) => {
    if (tempFilters[query] !== "" && tempFilters[query] !== undefined) {
      filters[query] = tempFilters[query];
    }
    return filters;
  }, {});

  //If username is specified, find user id of username
  if (filters["user"]) {
    User.findOne({username: username}, function (err, user) {
      if (user === null) {
        delete filters["user"];
      }
      else {
        filters["user"] = user._id;
      }
      Game.find(filters,function(err, games) {
        //If no matches, return no games
        if (games.length === 0 ) {
          res.render("index", {
            user : req.user,
            usernames: [],
            games : [],
            platforms: platforms,
            genres: genres
          });
        }
        //Otherwise, display all matches
        else {
          //Map users to their respective games
          const usernames = [];
          games.forEach((game) => {
            User.findOne({_id: game.user})
              .exec(function(err, user) {
                if (!err) {
                  usernames.push(user.username);
                }
                if (usernames.length === games.length) {
                  res.render("index", {
                    user : req.user,
                    usernames: usernames,
                    games : games,
                    platforms: platforms,
                    genres: genres
                  });
                }
              });
          });
        }
      });
    });
  }
  else {
    Game.find(filters,function(err, games) {
      //If no matches, return no games
      if (games.length === 0 ) {
        res.render("index", {
          user : req.user,
          usernames: [],
          games : [],
          platforms: platforms,
          genres: genres
        });
      }
      //Otherwise, display all matches
      else {
        //Map users to their respective games
        const usernames = [];
        games.forEach((game) => {
          User.findOne({_id: game.user})
            .exec(function(err, user) {
              if (!err) {
                usernames.push(user.username);
              }
              if (usernames.length === games.length) {
                res.render("index", {
                  user : req.user,
                  usernames: usernames,
                  games : games,
                  platforms: platforms,
                  genres: genres,
                });
              }
            });
        });
      }
    });
  }


};

//Display new game page
gameController.newGame = function(req, res) {
  if (!req.user) {
    res.render('login', {error: "Please log in to enter a new game."});
  }
  else {
    res.render("new-game", {user: req.user, platforms: platforms, genres: genres});
  }
};

//Add new game
gameController.addNewGame = function(req, res) {
  if (!req.user) {
    res.render('login', {error: "Please log in to enter a new game."});
  }
  else {
    //Prevent user from not selecting genre or platform
    if (req.body.genre === undefined || req.body.platform === undefined) {
      res.render("new-game", {
        error: "Game validation failed: Please make sure you fill out all fields",
        user: req.user,
        platforms: platforms,
        genres: genres
      });
    }
    else {
      //Add new game to db, storing user id
      new Game({
        user: req.user._id,
        title: req.body.title,
        genre: req.body.genre,
        platform: req.body.platform,
        desc: req.body.desc,
        privacy: req.body.privacy
      }).save(function(err) {
        if (err) {
          res.render("new-game", {
            error: "Game validation failed: Please make sure you fill out all fields",
            user: req.user,
            platforms: platforms,
            genres: genres
          });
        }
        else {
          res.redirect("/");
        }
      });
    }
  }
};


module.exports = gameController;
