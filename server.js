const fs = require('fs')
const path = require('path')
const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)

const staticPath = path.join(__dirname, 'static')

io.on('connection', function (socket) {
  socket.on('face', function (data) {
    socket.broadcast.emit('face', data)
    //socket.emit('face', data);
  });
});

app.use(express.static(staticPath))
app.get('/burn', function(req, res) {
  res.sendFile(path.join(staticPath, 'burning-man.html'))
})

require('dns').lookup(require('os').hostname(), function (err, add, fam) {
  console.log('addr ',add, 'path:', staticPath);
})

server.listen(1337);
