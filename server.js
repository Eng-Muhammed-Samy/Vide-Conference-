const express = require('express');
const app = express();
// import uuid after install it --> npm i uuid
const { v4: uuidv4 } = require('uuid');
// create server 
const server = require('http').Server(app);
const io = require('Socket.io')(server)

// tell express about view engin ejs
app.set('view engine', 'ejs');
app.use(express.static('public'))


app.get('/', (req, res) => {
    res.redirect(`/${uuidv4()}`);
});
// making uniqe id for every room
app.get('/:room', (req, res) => {
    res.render('room', { roomid: req.params.room })
});

io.on('connection', socket => {
    socket.on('join-room', (roomid, userid) => {
        socket.join(roomid);
        socket.to(roomid).broadcast.emit("user-connected", userid);
        socket.on('message', message => {
            io.to(roomid).emit('createMessage', message)
        })
        socket.on('disconnect', () => {
            socket.to(roomid).broadcast.emit("user-disconnected", userid);
        })
    })
})
server.listen(process.env.PORT || 5050);