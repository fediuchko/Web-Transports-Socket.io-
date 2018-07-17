var express = require('express')
var app = express()
var http =  require ('http').Server(app);

var io = require ('socket.io')(http);
  

var messages = getArrayWithLimitedLength(100);
var usersState =new Map();
// app.use(express.static(path.join(__dirname, 'public')));
app.get('/', function(req,res) {
    res.sendFile(__dirname + '/index.html');
});

app.get('/client.js', function(req,res) {
    res.sendFile(__dirname + '/client.js');
});

io.on('connection', function (socket) {
    console.log('client connected') ;

    socket.on('chat message', function(msg){
        messages.push(msg);
        io.emit('chat message', msg);    
    });

    socket.emit('chat history', messages);
   
    socket.on('login', function(data){
        console.log('a user ' + data.userNick + ' connected');
        console.log('socket.id  ' +socket.id);
        socket.broadcast.emit('user conected', data.userNick);
        usersState.set(socket.id, data.userNick);
    });

    socket.on('disconnect', function(){
        console.log(' disconnect socket.id  ' +socket.id);
        console.log('user ' + usersState.get(socket.id) + ' disconnected');'user disconected'
        socket.broadcast.emit('user disconected', usersState.get(socket.id));
        //todo send to all users info that this current user has left a chat socket.emmit()
    });
       
    socket.on('typing', (data) => {
        socket.broadcast.emit('start:typing', {
            userNick: data.userNick
        });
    });

    socket.on('stop typing', (data) => {
        socket.broadcast.emit('stop:typing', {
            userNick: data.userNick
        });
    });
    //  socket.on('typing', function (data) {

    //      if (data.userNick && data.message) {

    //        $('.typing').html("User: " + data.userNick + ' ' + data.message);

    //      } else {

    //        $('.typing').html("");

    //     }

    //      });

    //     var typing = false;

    //       var timeout = undefined;

    //        function timeoutFunction(){

    //      typing = false;

    //        socket.emit(noLongerTypingMessage);

    //        }  
});

function getArrayWithLimitedLength(length) {
    var array = new Array();

    array.push = function () {
        if (this.length >= length) {
            this.shift();
        }
        return Array.prototype.push.apply(this,arguments);
    }

    return array;

}


http.listen(5000, function(){
    console.log('listening on :5000')
});