const mongoose = require("mongoose");
const genres = ["Shooter", "Sports", "RPG", "Racing", "Fighting", "Strategy"];
const platforms = ["Console", "PC", "Mobile"];

require("./User");

//Represents game
const GameSchema = new mongoose.Schema({
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}, // a reference to a User object
  title: {type: String, required: true}, //title of game
  privacy: {type: String, enum: ["public", "private"], required: true}, //game is either private or public to other users
  genre: {type: String, enum: genres, required: true}, //genre(s) of game
  platform: {type: String, enum: platforms, required: true}, //platform(s) game will launch on
  desc: {type: String, required: true, maxlength: 100}, //game description
});

//Export Game and user model
module.exports = {
  Game: mongoose.model('Game', GameSchema),
  genres: genres,
  platforms: platforms
};
