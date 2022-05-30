/* ******** */

// const http = require('http');

// const hostname = '127.0.0.1';
// const port = 3000;

// const server = http.createServer((req, res) => {
//     res.statusCode = 200;
//     res.setHeader('Content-Type', 'text/plain');
//     res.end('Hello World');
// });

// server.listen(port, hostname, () => {
//     console.log(`Server running at http://${hostname}:${port}/`);
// });

// console.log('The server is running')


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
                file.serve(request,response)
            }
        ).resume();
    }
).listen(port);


console.log('The server is running');