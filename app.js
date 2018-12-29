//Import modules
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

// Routing
const index = require('./routes/index');
const users = require('./routes/users');

//Server
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const port = process.env.PORT || '3000';

// view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//Database
require("./db");
const User = require('./models/User');
const Message = require('./models/Message');

//Allows req body to be visible
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//Session management
app.use(cookieParser());
app.use(require('express-session')({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));

//Logger
app.use( (req, res, next) => {
  console.log("\n" + req.method, req.path, '\n=====\n','req.query: ', req.query, '\n req.body: ', req.body, '\n');
  if (req.user) {
    console.log("User: " + req.session.user["username"]);
    console.log("User ID: " + req.session.user["_id"]);
  }
  next();
});

//Passport configuration
const flash = require("express-flash-messages");
app.use(flash());

const passport = require('passport');
app.use(passport.initialize());
app.use(passport.session());

const LocalStrategy = require('passport-local').Strategy;
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(userId, done) {
  User.findById(userId, (err, user) => done(err, user));
});

//Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', index);
app.use('/users', users);

//Web socket setup
let chat;

//Wait for connection from client
io.on('connection', function (socket) {
  //Get messages from chatroom
  socket.on('send chatroomId', (chatroomId) => {
    //Reset chat for new connection
    chat = {};

    console.log("Received chatid " + chatroomId);

    //Get messages that belong to the chatroom id
    Message.find({ chatroomId: chatroomId })
      .select('createdAt body author')
      .sort('-createdAt')
      .populate({
        path: 'author',
        select: 'profile.firstName profile.lastName'
      })
      .exec(function(err, messages) {
        if (err) {
          throw err;
        }
        else {
          console.log("All messages in chat:");
          console.log(messages);

          //Map message bodies to chat
          chat["messages"] = messages.map((message) => message.body);
          console.log("Messages in server chat: ");
          console.log(chat["messages"]);

          //Map messages to author's username
          const authorLog = [];
          messages.forEach((message) => {
            User.findOne({_id: message.author})
              .exec(function(err, user) {
                if (!err) {
                  authorLog.push(user.username);
                }
                if (authorLog.length === messages.length) {
                  //Add recipientsLog to chat
                  chat["authorLog"] = authorLog;

                  //Filter out only the people in the chat from authorLog
                  const users = [...new Set(authorLog)];

                  //Add users in chat to chat
                  chat["users"] = users;

                  //Emit conversation
                  io.emit('output', chat);
                }
              });
          });
      }
    });
  });
  //Listen for new message from chatroom
  socket.on('new message', (message) => {
    console.log("Server: received new message");
    console.log(message);

    console.log("Original chat");
    console.log(chat);

    //Get user id
    User.findOne({username: message["author"]})
      .exec((err, user) => {
        if (!err) {
          const newMessage = new Message({
            chatroomId: message["chatroomId"],
            body: message["body"],
            author: user._id
          });
          newMessage.save((err) => {
            if (err) {
              console.log(err);
            }
            else {
              console.log("Saved new message in db:");
              console.log(newMessage);

              //Update chat
              if (chat["messages"] && chat["authorLog"]) {
                console.log("PUSHING");
                chat["messages"].unshift(message["body"]);
                chat["authorLog"].unshift(message["author"]);
              }
              //Or initialize it
              else {
                console.log("initializing");
                chat["messages"] = [];
                chat["messages"].push(message["body"]);
                chat["authorLog"] = [];
                chat["authorLog"].push(message["author"]);
              }

              //Filter out only the people in the chat from authorLog
              const users = chat["authorLog"].filter((author, index) => {
                return chat["authorLog"].indexOf(author) >= index;
              });

              //Add users in chat to chat
              chat["users"] = users;

              console.log("Updated chat");
              console.log(chat);

              io.emit('output', chat);
            }
          });
        }
      });
  });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

//Listen with server
server.listen(port);
