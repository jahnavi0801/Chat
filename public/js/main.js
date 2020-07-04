const chatForm = document.getElementById('chat-form')
const chatInvite = document.getElementById('chat-invite')
const chatMessages = document.querySelector('.chat-messages')
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

//get Username and room from index.html
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
})

const socket = io()

//Username and room to the server side
socket.emit('joinroom', ({ username, room }))

// Get room and users
socket.on('roomUsers', ({ room, users }) => {
    outputRoomName(room);
    outputUsers(users);
});

//input messages from server
socket.on('message', message => {
    outmessages(message)

    //scroll Down
    chatMessages.scrollTop = chatMessages.scrollHeight
})

//event listenner for submission of that form
chatForm.addEventListener('submit', (e) => {
    e.preventDefault()

    //text input
    const msg = e.target.elements.msg.value

    //Emitting msg to server
    socket.emit('chatMsg', msg);

    //clear text box after submmision
    e.target.elements.msg.value = ''
    e.target.elements.msg.focus()
})

chatInvite.addEventListener('submit', (b) => {
    b.preventDefault()
    const msg = b.target.elements.number.value

    //Emitting number to server
    socket.emit('inviteNo', msg);

    b.target.elements.number.value = ''
    b.target.elements.number.focus()
})

//Output messages to clinet
function outmessages(message) {
    const div = document.createElement('div')
    div.classList.add('message')
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>`

    document.querySelector('.chat-messages').appendChild(div)
}

// Add room name to DOM
function outputRoomName(room) {
    roomName.innerText = room;
  }
  
  // Add users to DOM
  function outputUsers(users) {
    userList.innerHTML = `
      ${users.map(user => `<li>${user.username}</li>`).join('')}
    `;
  }
  