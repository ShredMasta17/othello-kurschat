/* CLIENT SIDE */
/* Website function */ 


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
    return null; // <---- 
}

let username = decodeURI(getIRIParameterValue('username'));
if ((username.length === 0) || (typeof username == 'undefined') || (username === null) || (username === 'null')) { 
    username = "Anonymous_"+Math.floor(Math.random()*1000);
}

// let chatRoom = 'Lobby'; 
let chatRoom = decodeURI(getIRIParameterValue('game_id'));
if ((typeof chatRoom == 'undefined') || (chatRoom === null) || (chatRoom === 'null')) { // (chatRoom.length === 0)
    chatRoom = 'Lobby';
}

/* Set up the socket.io connection to the server */
let socket = io();
socket.on('log',function(array) {
    console.log.apply(console, array);
});

function makeInviteButton(socket_id) {
    let newHTML = "<button type='button' class='btn btn-outline-primary'>Invite</button>";
    let newNode = $(newHTML);
    newNode.click( () => {
        let payload = {
            requested_user: socket_id,
        }
        console.log('**** Client log message, sending \'invite\' command: ' +JSON.stringify(payload));
        socket.emit('invite', payload);
    });
    return newNode;
}

function makeInvitedButton(socket_id) {
    let newHTML = "<button type='button' class='btn btn-primary'>Uninvite</button>";
    let newNode = $(newHTML);
    newNode.click( () => {
        let payload = {
            requested_user: socket_id,
        }
        console.log('**** Client log message, sending \'uninvite\' command: ' +JSON.stringify(payload));
        socket.emit('uninvite', payload);
    });
    return newNode;
}

function makePlayButton(socket_id) {
    let newHTML = "<button type='button' class='btn btn-success'>Play</button>";
    let newNode = $(newHTML);
    newNode.click( () => {
        let payload = {
            requested_user: socket_id,
        }
        console.log('**** Client log message, sending \'game_start\' command: ' +JSON.stringify(payload));
        socket.emit('game_start', payload);
    });
    return newNode;
}

function makeStartGameButton() {
    let newHTML = "<button type='button' class='btn btn-danger'>Starting Game</button>";
    let newNode = $(newHTML);
    return newNode;
}

socket.on('invite_response', (payload) => { // Pt 14 => 9:00
    if ((typeof payload == 'undefined') || (payload === null)) {
        console.log('Server did not send a payload');
    }
    if (payload.request === 'fail') {
        console.log(payload.message);
        return;
    }
    let newNode = makeInvitedButton(payload.socket_id);
    $('.socket_' + payload.socket_id + ' button').replaceWith(newNode);
});

socket.on('invited', (payload) => {
    if ((typeof payload == 'undefined') || (payload === null)) {
        console.log('Server did not send a payload');
    }
    if (payload.request === 'fail') {
        console.log(payload.message);
        return;
    }
    let newNode = makePlayButton(payload.socket_id);
    $('.socket_' + payload.socket_id + ' button').replaceWith(newNode);
});

socket.on('uninvited', (payload) => {
    if ((typeof payload == 'undefined') || (payload === null)) {
        console.log('Server did not send a payload');
    }
    if (payload.request === 'fail') {
        console.log(payload.message);
        return;
    }
    let newNode = makeInviteButton(payload.socket_id);
    $('.socket_' + payload.socket_id + ' button').replaceWith(newNode);
});

socket.on('game_start_response', (payload) => {
    if ((typeof payload == 'undefined') || (payload === null)) {
        console.log('Server did not send a payload');
    }
    if (payload.request === 'fail') {
        console.log(payload.message);
        return;
    }
    let newNode = makeStartGameButton();
    $('.socket_' + payload.socket_id + ' button').replaceWith(newNode);
    /* Jump to the game page */
    window.location.href = 'game.html?username=' + username + '&game_id=' + payload.game_id;
});

socket.on('join_room_response', (payload) => {
    if ((typeof payload == 'undefined') || (payload === null)) {
        console.log('Server did not send a payload');
    }
    if (payload.request === 'fail') {
        console.log(payload.message);
        return;
    }

    /* If we are being notified of ourselves, then ignore the message and return */
    if (payload.socket_id === socket.id) {
        return;
    }

    let domElements = $('.socket_' +payload.socket_id);
    /* If we are being repeat notified, then return */
    if (domElements.length !== 0) {
        return;
    }

    /*
        <div class="row align-items-center">
            <div class="col text-end">
                Marcus
            </div>
            <div class="col text-end">
                <button type="button" class="btn btn-primary">Invite</button>
            </div>
        </div>
    */

    let nodeA = $("<div></div>");
    nodeA.addClass("row");
    nodeA.addClass("align-items-center");
    nodeA.addClass("socket_" + payload.socket_id);
    nodeA.hide(); 

    let nodeB = $("<div></div>")
    nodeB.addClass("col");
    nodeB.addClass("text-end");
    nodeB.addClass("socket_" + payload.socket_id);
    nodeB.append('<h4>' + payload.username + '</h4>');

    let nodeC = $("<div></div>")
    nodeC.addClass("col");
    nodeC.addClass("text-start");
    nodeC.addClass("socket_" + payload.socket_id);
    let buttonC = makeInviteButton(payload.socket_id);
    nodeC.append(buttonC);

    nodeA.append(nodeB); 
    nodeA.append(nodeC);

    $("#players").append(nodeA);
    nodeA.show("fade", 1000);


    /* Announcing in the chat that someone has arrived */
    if (payload.count == 1) {
        let newHTML = '<p class=\'join_room_response\'>'+payload.username+' joined the chatroom. (There is '+payload.count+' user in this room)</p>';
        let newNode = $(newHTML);
        newNode.hide();
        $('#messages').prepend(newNode);
        newNode.show('fade', 500);
    } else {
        let newHTML = '<p class=\'join_room_response\'>'+payload.username+' joined the chatroom. (There are '+payload.count+' users in this room)</p>';
        let newNode = $(newHTML);
        newNode.hide();
        $('#messages').prepend(newNode);
        newNode.show('fade', 500);
    }

    // Slide down old entries??

});

socket.on('player_disconnected', (payload) => {
    if ((typeof payload == 'undefined') || (payload === null)) {
        console.log('Server did not send a payload');
    }

    if (payload.socket_id === socket.id) {
        return;
    }

    let domElements = $('.socket_' +payload.socket_id);
    /* If we are being repeat notified, then return */
    if (domElements.length !== 0) {
        domElements.hide("fade", 500);
    }

    if (payload.count == 1) {
        let newHTML = '<p class=\'left_room_response\'>'+payload.username+' left the chatroom. (There is '+payload.count+' user in this room)</p>';
        let newNode = $(newHTML);
        newNode.hide();
        $('#messages').prepend(newNode);
        newNode.show('fade', 500);
    } else {
        let newHTML = '<p class=\'left_room_response\'>'+payload.username+' left the chatroom. (There are '+payload.count+' users in this room)</p>';
        let newNode = $(newHTML);
        newNode.hide();
        $('#messages').prepend(newNode);
        newNode.show('fade', 500);
    }
    
    // Slide down old entries??

});

function sendChatMessage() {
    let request = {};
    request.room = chatRoom;
    request.username = username;
    request.message = $('#chatMessage').val();
    console.log('**** Client log message, sending \' join_room\' command: ' +JSON.stringify(request));
    socket.emit('send_chat_message', request);
    $('#chatMessage').val("");
} 

socket.on('send_chat_message_response', (payload) => {
    if ((typeof payload == 'undefined') || (payload === null)) {
        console.log('Server did not send a payload');
    }
    if (payload.request === 'fail') {
        console.log(payload.message);
        return;
    }
    let newHTML = '<p class=\'chat_message\'><b>'+payload.username+'</b>: '+payload.message+'</p>';
    let newNode = $(newHTML);
    newNode.hide();
    $('#messages').prepend(newNode);
    newNode.show('fade', 500);

});

let old_board = [
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', 'g', 'p', ' ', ' ', ' '],
    [' ', ' ', ' ', 'p', 'g', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ']
];

let my_color = "";
let interval_timer;

socket.on('game_update', (payload) => {
    if ((typeof payload == 'undefined') || (payload === null)) {
        console.log('Server did not send a payload');
    }
    if (payload.request === 'fail') {
        console.log(payload.message);
        return;
    }
    
    let board = payload.game.board
    if ((typeof board == 'undefined') || (board === null)) {
        console.log('Server did not send a valid board to display');
        return; 
    }

    /* Update my color */
    if (socket.id === payload.game.player_green.socket) {
        my_color = 'green';
    } else if (socket.id === payload.game.player_purple.socket) {
        my_color = 'purple';
    } else {
        /* Kick back to lobby */
        window.location.href = 'lobby.html?username=' + username;
        return;
    }

    if (my_color === 'green') {
        $("#my_color").html('<h3 id="my_color">I am Green</h3>')
    } else if (my_color === 'purple') {
        $("#my_color").html('<h3 id="my_color">I am Purple</h3>')
    } else {
        $("#my_color").html('<h3>Error: Don\'t know whose turn it is</h3>');
    }

    if (payload.game.whose_turn === 'green') {
        $("#my_color").append('<h4>It is Green\'s turn</h4>');
    } else if (payload.game.whose_turn === 'purple') {
        $("#my_color").append('<h4>It is Purple\'s turn</h4>');
    } else {
        $("#my_color").append('<h4>Error: Don\'t know whose turn it is</h4>');
    }

    // console.table(old_board)
    // console.table(board)

    let greensum = 0;
    let purplesum = 0;

    /* Animate changes to the board */
    for (let row = 0; row < 8; row++) {
        for (let column = 0; column < 8; column++) {
            if (board[row][column] === 'g') {
                greensum++;
            } else if (board[row][column] === 'p') {
                purplesum++;
            }

            /* Check if server changed board */
            if (old_board[row][column] !== board[row][column]) {
                let graphic = "";
                let altTag = "";

                if ((old_board[row][column] === '?') && (board[row][column] === ' ')) {
                    graphic = "empty.gif";
                    altTag = "empty space"; 
                } else if ((old_board[row][column] === '?') && (board[row][column] === 'g')) {
                    graphic = "green-64.gif";// "empty-green.gif";
                    altTag = "green token"; 
                } else if ((old_board[row][column] === '?') && (board[row][column] === 'p')) {
                    graphic = "purple-64.gif";// "empty-purple.gif";
                    altTag = "purple token"; 
                } else if ((old_board[row][column] === ' ') && (board[row][column] === 'g')) {
                    graphic = "green-64.gif";// "empty-green.gif";
                    altTag = "green token"; 
                } else if ((old_board[row][column] === ' ') && (board[row][column] === 'p')) {
                    graphic = "purple-64.gif";// "empty-purple.gif";
                    altTag = "purple token"; 
                } else if ((old_board[row][column] === 'g') && (board[row][column] === ' ')) {
                    graphic = "green-empty.gif";
                    altTag = "empty space"; 
                } else if ((old_board[row][column] === 'p') && (board[row][column] === ' ')) {
                    graphic = "purple-empty.gif";
                    altTag = "empty space"; 
                } else if ((old_board[row][column] === 'g') && (board[row][column] === 'p')) {
                    graphic = "purple-64.gif"; //"green-purple-64.gif";
                    altTag = "purple token"; 
                } else if ((old_board[row][column] === 'p') && (board[row][column] === 'g')) {
                    graphic = "green-64.gif"; //"purple-green-64.gif";
                    altTag = "green token"; 
                } else {
                    graphic = "ERROR.gif";
                    altTag = "error"; 
                }

                
                const t = Date.now();
                $('#' + row + '_' + column).html('<img class="img-fluid" src="assets/images/' + graphic + '?time=' + t + '" alt="' + altTag + '" />');
            }  
            
            /* set up interactivity */
            $('#' + row + '_' + column).off('click');
            $('#' + row + '_' + column).removeClass('hovered_over');
            if (payload.game.whose_turn === my_color) {
                if (payload.game.legal_moves[row][column] === my_color.substring(0,1)) {
                    $('#' + row + '_' + column).addClass('hovered_over');
                    $('#' + row + '_' + column).click(((r, c) => {
                        return (() => {
                            let payload = {
                                row: r,
                                column: c,
                                color: my_color
                            };
                            console.log('**** Client log message, sending \'play_token\' command: ' + JSON.stringify(payload));
                            socket.emit('play_token', payload);
                        });
                    })(row, column));
                }
            }

            // console.log('#' + row + '_' + column);

            /* 
                I can change token color on each side
                Clicking on any part of the row changes a single token on a diagonal from the TL to BR
                Can only place on this line
                One page doesn't hover, is it purple?
                Purple cannot hover
                Token won't change when you click on it specifically, just the row will change it
                Recognizes the right cell in the table, just only updates on the diagonal
                Only get the client log message for purple
                Weird nested function sees the right position, but what the server(?) registers is different
                Is it just registering the click of the row, then associating that with the column?

            */
        }
    }

    clearInterval(interval_timer);
    interval_timer = setInterval( ((last_time) => {
        return ( () => {
            let d = new Date();
            let elapsed_m = d.getTime() - last_time
            let minutes = Math.floor((elapsed_m / 1000) / 60);
            let seconds = Math.floor(elapsed_m % (60 * 1000) / 1000);
            let total = minutes * 60 + seconds;
            if (total > 100) {
                total = 100;
            }
            $("#elapsed").css("width", total+"%").attr("aria-valuenow", total);
            let timestring = "" + seconds;
            timestring = timestring.padStart(2, '0');
            timestring = minutes + ":" + timestring;
            if (total < 100) {
                $("#elapsed").html(timestring);
            } else {
                $("#elapsed").html("Times up!");
            }
        })
    })(payload.game.last_move_time)
        , 1000);

    $('#greensum').html(greensum);
    $('#purplesum').html(purplesum); 
    old_board = board;
});

socket.on('play_token_response', (payload) => {
    if ((typeof payload == 'undefined') || (payload === null)) {
        console.log('Server did not send a payload');
    }
    if (payload.request === 'fail') {
        console.log(payload.message);
        alert(payload.message);
        return;
    }
    
});

socket.on('game_over', (payload) => {
    if ((typeof payload == 'undefined') || (payload === null)) {
        console.log('Server did not send a payload');
    }
    if (payload.request === 'fail') {
        console.log(payload.message);
        return;
    }
    
    /* Announce with a button to the lobby */
    let nodeA = $("<div id='game_over'></div>");
    let nodeB = $("<h1>Game Over</h1>");
    let nodeC = $("<h2>"+ payload.who_won + " won!</h2>");
    let nodeD = $("<a href='lobby.html?username="+ username + "' class='btn btn-lg btn-success' role='button'>Return to Lobby</a>");
    nodeA.append(nodeB); 
    nodeA.append(nodeC);
    nodeA.append(nodeD);
    nodeA.hide();
    $('#game_over').replaceWith(nodeA);
    nodeA.show('fade', 1000);
});

/* Request to join the chat room */
$( () => {
    let request = {};
    request.room = chatRoom;
    request.username = username;
    console.log('**** Client log message, sending \' join_room\' command: ' +JSON.stringify(request));
    socket.emit('join_room', request);

    $('#lobbyTitle').html(username + "'s Lobby"); 
    $('#quit').html("<a href='lobby.html?username="+ username + "' class='btn btn-lg btn-success' role='button'>Quit</a>");



    $('#chatMessage').keypress( function (e){
        let key = e.which;
        if (key == 13) { // The 'enter' key
            $('button[id = chatButton]').click();
            return false
        }
    })

});

