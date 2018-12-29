//code adapted from https://blog.slatepeak.com/creating-a-real-time-chat-api-with-node-express-socket-io-and-mongodb/
const Chatroom = require('../models/Chatroom'),
      User = require('../models/User');

exports.getChatrooms = function(req, res) {
  if (!req.user) {
    res.render('login', {
      error: "Log in to view chatrooms"
    });
  }
  else {
    // Return chatrooms
    Chatroom.find({ users: req.user._id })
      .exec(function(err, chatrooms) {
        if (err) {
          res.render('chatrooms', {
            user: req.user,
            error: err
          });
        }
        //If no conversations, just load the page
        if (chatrooms.length === 0) {
          res.render('chatrooms', {
            user: req.user,
            error: "No chatrooms created yet"
          });
        }
        else {
          //Map chatrooms to their recipients
          const recipients = [];
          chatrooms.forEach((chatroom)=> {
            chatroom.users.forEach((userId) => {
              User.findOne({_id: userId})
                .exec(function(err, user) {
                  if (!err && user.username!==req.user.username) {
                    recipients.push(user.username);
                  }
                  if (recipients.length === chatrooms.length) {
                    res.render ('chatrooms', {
                      user: req.user,
                      recipients: recipients,
                      chatrooms: chatrooms
                    });
                  }
                });
            });
          });
        }
    });
  }
};

exports.getChatroom = function(req, res) {
  if (!req.user) {
    res.render('login', {
      error: "Log in to view chatrooms"
    });
  }
  else {
    //Get subject of chat to display
    console.log(req.params["chatroomSlug"]);
    Chatroom.findOne({ _id: req.params["chatroomSlug"] })
      .exec(function(err, chatroom) {
        if (err || chatroom === null) {
          res.render('chatrooms', {
            user: req.user,
            error: err
          });
        }
        else {
          res.render('messages', {
            user: req.user,
            subject: chatroom.subject
          });
        }
      });
    }
};

exports.newChatroom = function(req, res) {
  if (!req.user) {
    res.render('login', {
      error: "Log in to view chatrooms"
    });
  }
  else {
    //Make sure username entered is a registered user
    User.findOne({"username" : req.body.username}, function (err, user) {
      console.log(user);
      if (err) {
        res.render('chatrooms', {
          user : req.user,
          error: "Error creating new chatroom."
        });
      }
      if (user === null) {
        res.render('chatrooms', {
          user : req.user,
          error: "Invalid username"
        });
      }
      else {
        const chatroom = new Chatroom({
          users: [req.user._id, user._id],
          subject: req.body.subject
        });
        chatroom.save(function(err) {
          if (err) {
            console.log("ERROR IN SAVE CHAT");
            console.log(err);
            res.render('chatrooms', {
              user: req.user,
              error: 'Error creating new chat'
            });
          }
          else {
            res.render('messages', {
              user: req.user
            });
          }
        });
      }
    });
  }
};
