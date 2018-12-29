const socket = io();

function main() {
  const btn = document.querySelector("#btn");
  const chatDiv = document.getElementById("chatDiv");
  const usersDiv = document.getElementById("usersDiv");

  //Get chatroom id
  const chatroomId = document.location.pathname.split("/")[2];
  console.log("Entered Chatroom Id: " + chatroomId);

  // //Emit chatroomId
  socket.emit('send chatroomId', chatroomId);
  socket.on('output', (chat) => {
    console.log("Receiving updated chat");
    console.log(chat);
    if (chat) {
      if (chat["users"].length) {
        //Clear existing users in chat
        while (usersDiv.firstChild) {
            usersDiv.removeChild(usersDiv.firstChild);
        }
        //Create user header
        const usersHeader = document.createElement('h3');
        usersHeader.setAttribute('class', 'user-header');
        usersHeader.textContent = "Users in chat:";

        //Populate user header with users
        for (let i = 0; i < chat["users"].length; i++) {
          usersHeader.textContent += " " + chat["users"][i];
        }
        //Add user header to usersDiv
        usersDiv.appendChild(usersHeader);
      }
      if (chat["messages"].length) {
        //Clear existing chat
        while (chatDiv.firstChild) {
            chatDiv.removeChild(chatDiv.firstChild);
        }
        //Add messages to chatDiv
        for (let i = 0; i < chat["messages"].length; i++) {
          console.log("Message Author " + (i) + " " + chat["authorLog"][i]);
          console.log("Message Body " + (i) + " " + chat["messages"][i]);
          console.log(chat["authorLog"][i]);

          const message = document.createElement('p');
          message.setAttribute('class', 'chat-message');
          message.textContent = chat["authorLog"][i] + ": " + chat["messages"][i];
          chatDiv.insertBefore(message, chatDiv.firstChild);
        }
      }
    }
  });

  btn.addEventListener('click', function () {
    console.log("button pressed");

    //Data to pass
    const message = {};

    message["chatroomId"] = chatroomId;
    console.log("Send Chatroom Id: " + chatroomId);

    //Get author
    message["author"] = document.getElementById("username").textContent.split(" ")[1];
    console.log("Send Author: " + message["author"]);

    //Get message body
    message['body'] = document.querySelector('#message').value;
    console.log("Send Body: " + message['body']);

    socket.emit('new message', message);
  });
}

document.addEventListener("DOMContentLoaded", main);
