const mongoose = require('mongoose');
const Schema = mongoose.Schema;

require("./Chatroom");
require("./User");

const MessageSchema = new Schema({
  chatroomId: {type: mongoose.Schema.Types.ObjectId, ref: 'Chatroom'}, // a reference to Chatroom object
  body: {type: String, required: true},
  author: {type: mongoose.Schema.Types.ObjectId, ref: 'User'} //reference to who wrote the message
},
{
  timestamps: true
});

module.exports = mongoose.model('Message', MessageSchema);
