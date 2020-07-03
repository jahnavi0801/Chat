const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const formatMessages = require('./utlis/messages')
const { userJoin, getUser, userLeft, getRoom } = require('./utlis/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

//BotName 
const botName = 'Admin'

//set a static folder 
app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
  res.sendFile('./public/index.html', { root: __dirname });
});

//when user connects
io.on('connection', socket => {
    socket.on('joinroom', ({ username, room }) => {
        const user = userJoin(socket.id, username, room)

        socket.join(user.room)

        //welcome message
        socket.emit('message', formatMessages(botName,`${user.username} Welcome to group ${user.room}!`))

        //show to all the members except user or use (io.emit) for every member
        socket.broadcast.to(user.room).emit('message', formatMessages(botName, `${user.username} has joined the chat`))

        //room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoom(user.room)
        })
    })
    
    //catch chatMsg
    socket.on('chatMsg', msg => {
        const user = getUser(socket.id)
        //emit back to the client
        io.to(user.room).emit('message', formatMessages(user.username, msg))
    })

     // disconnect when user leaves
     socket.on('disconnect', () => {
        const user = userLeft(socket.id)
        if (user) {
            io.to(user.room).emit(
              'message',
              formatMessages(botName, `${user.username} has left the chat`)
            );
      
            // Send users and room info
            io.to(user.room).emit('roomUsers', {
              room: user.room,
              users: getRoom(user.room)
            });
          }
    })
})

const PORT = process.env.PORT || 5000
server.listen(PORT, () => console.log(`server is running on PORT ${PORT}`))
