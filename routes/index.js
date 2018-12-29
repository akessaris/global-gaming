const express = require('express');
const router = express.Router();
const auth = require("../controllers/AuthController");
const game = require("../controllers/GameController");
const chat = require("../controllers/ChatController");

// rout to home page
router.get('/', game.home);

// route to register page
router.get('/register', auth.register);

// route for register action
router.post('/register', auth.doRegister);

// route to login page
router.get('/login', auth.login);

// route for login action
router.post('/login', auth.doLogin);

// route for logout action
router.get('/logout', auth.logout);

// route for adding new game
router.get('/new-game', game.newGame);

// route for adding new game
router.post('/new-game', game.addNewGame);

// View all chatrooms to and from authenticated user
router.get('/chatrooms', chat.getChatrooms);

// Start new chatroom
router.post('/chatrooms', chat.newChatroom);

// Retrieve single chatroom
router.get('/chatrooms/:chatroomSlug', chat.getChatroom);

// Send reply in chatroom
// router.post('/chatrooms/:chatroomSlug', chat.sendReply);

module.exports = router;
