/* CLIENT SIDE */

function getIRIParameterValue(requestedKey) {
    let pageIRI = window.location.search.substring(1);
    let pageIRIVariables = pageIRI.split('&');
    for (let i = 0; i < pageIRIVariables.length; i++) {
        let data = pageIRIVariables[i].split('=')
        let key = data[0];
        let value = data[1];
        if (key === requestedKey) {
            return value;
        }
    }
    return value;
}

let username = decodeURI(getIRIParameterValue('username'));
if (username.length === 0) {//(typeof username == 'undefined' || username === null) { 
    username = "Anonymous_"+Math.floor(Math.random()*1000);
}
// $('#messages').prepend('<b>'+username+':</b>');


let chatRoom = 'Lobby';

/* Set up the socket.io connection to the server */
let socket = io();
socket.on('log',function(array) {
    console.log.apply(console, array);
});

socket.on('join_room_response', (payload) => {
    if ((typeof payload == 'undefined') || (payload === null)) {
        console.log('Server did not send a payload');
    }
    if (payload.request === 'fail') {
        console.log(payload.message);
        return;
    }
    let newString = '<p class=\'join_room_response\'>'+payload.username+' joined the '+payload.room+'. (There are '+payload.count+' users in this room)</p>';
    $('#messages').prepend(newString);

});

function sendChatMessage() {
    let request = {};
    request.room = chatRoom;
    request.username = username;
    request.message = $('#chatMessage').val();
    console.log('**** Client log message, sending \' join_room\' command: ' +JSON.stringify(request));
    socket.emit('send_chat_message', request);
} 


/* Request to join the chat room */
$( () => {
    let request = {};
    request.room = chatRoom;
    request.username = username;
    console.log('**** Client log message, sending \' join_room\' command: ' +JSON.stringify(request));
    socket.emit('join_room', request);
});

