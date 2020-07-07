'use strict';

const server = require('http').createServer();
const io = require('socket.io')(server);
const port = 3000;

server.listen(port, () => {
    console.log('Server is running on port: ' + port);
});

let socketsMap = new Map(); // mapping (name -> Socket)

io.on('connection', (socket) => {

    //New client
    console.log('New client connected');

    let socketName = "";

    socket.on('disconnect', () => {
        // When disconnecting, a proper message is displayed
        console.log('Client disconnected!');

        socket.broadcast.emit('disconnectClient', socketName);
        socketsMap.delete(socketName);
    });

    // Checks whether the client has already been registered
    socket.on('verifyName', (name) => {

        let added = !socketsMap.has(name);
        // socket.emit('clientAdded', added);

        if(added) {
            /** If true, send a notification to all other clients
             *  And the new one receives a list with the name of the others
             */
            socket.emit('clientAdded', added);
            socket.emit('newAdded', Array.from(socketsMap.keys()));
            socket.broadcast.emit('broadcastAdded', name);
            socketsMap.set(name, socket);
            socketName = name;
        }
        else {
            // Client was not added => disconnect
            socket.emit('clientNotAdded');
            socket.disconnect(); // might work, still needs to close the readline from the client
        }
    });

    // Server receives a message from the client and sends it forward to its destination
    socket.on('clientToServerMessage', (input) => {

        let inputArray = input.split(':');
        let message = inputArray[1];

        if(inputArray.length > 1) {
            // Good format. (not :message, clientDest:, or :)

            if(inputArray[0].trim().length === 0 || message.length === 0) {
                socket.emit('wrongFormat', 'Message or client should be filled in!');
            } else if(inputArray[0].trim() === 'broadcast') {
                // Client chose the 'broadcast' option
                socket.broadcast.emit('serverToClientMessage', {socketExp: socketName, message : message.trim()});
            } else {
                // Client did not chose the 'broadcast' option
                if(socketsMap.has(inputArray[0].trim())) {
                    // Checks if the receiver client exists
                    let socketDest = socketsMap.get(inputArray[0].trim());
                    socketDest.emit('serverToClientMessage', { socketExp: socketName, message : message.trim()});
                }
                else {
                    // Receiver does not exist, sends back a warning message
                    socket.emit('wrongFormat', 'Client ' + inputArray[0].trim() + ' does not exist!');
                }
            }
        } else {
            // Wrong format of the message
            socket.emit('wrongFormat', 'Wrong format of the message!');
        }
    });
});
