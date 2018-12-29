const mongoose = require('mongoose');
const Schema = mongoose.Schema;

require("./User");

const ChatroomSchema = new Schema({
  users: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}], // a reference to User objects in the chat
  subject: {type:String}
});

module.exports = mongoose.model('Chatroom', ChatroomSchema);
