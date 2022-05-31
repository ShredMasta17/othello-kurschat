/* ***************************** */
/* Set up the static file server */
let static = require('node-static');

/* Set up the http server library */
let http = require('http');

/* Assume that we are running on Heroku */
let port = process.env.PORT;
let directory = __dirname + '/public';

/* If we aren't on Heroku, then we need to adjust aour port and directory */
if ((typeof port == 'undefined') || (port === null)) {
    port = 8080;
    directory = './public';
}

/* Set up our sttic file web server to deliver files from the filesystem */
let file = new static.Server(directory);

/* Wiring it all together */
let app = http.createServer(
    function(request,response) {
        request.addListener('end',
            function() {
                file.serve(request,response);
            }
        ).resume();
    }
).listen(port);


console.log('The server is running');


/* ***************************** */
/* WSet up the web socket server */

const { Server } = require("socket.io");
const io = new Server(app);

io.on('connection', (socket) => {

    /* Output a log message on the server and send it to the clients */
    function serverLog(...messages) {
        io.emit('log',['**** Message from the server:\n'])
        messages.forEach((item) => {
            io.emit('log',['****\t'+item]);
            console.log(item);
        })
    }

    serverLog('a page connected to the server: '+socket.id);

    socket.on('disconnect', ()=> {
        serverLog('a page disconnected to the server: '+socket.id);
    })

    /* join_room command handler */
    /* expected payload:
        {
            'room': the room to be joined,
            'username': the name of the user joining the room
        }
    */
    /* join_room_response:
        {
            'result': 'success',
            'room: room that was joined,
            'username': the user that jioned the room,
            'count': the number of users in the chat room
        }
    or 
        {
            'result': 'fail',
            'message: the reason for failure
        }
    */
    
    socket.on('join_room', ()=> {
        serverLog('Server recieved a command', '\join_room\'', JSON.stringify(payload));
    })
}) 