const server = require('socket.io-client');
const client = server.connect('http://localhost:3000');

let currentName = '';
const readline = require('readline').createInterface(
    {
        input: process.stdin,
        output: process.stdout
    }
);

client.on('connect', () => {

    client.readLine = readline;
    readline.question('New client! Name: ', (name) => {

        // stores its name
        currentName = name;

        // Sends the client's new name to server
        client.emit('verifyName', name);
    });

    readline.on('line', (input) => {
        // After the message was typed, it is sent to the server
        client.emit('clientToServerMessage', input);
    });
});

// Checks whether the client was added or not
client.on('clientAdded', () => {
        console.log(currentName + ' was successfully added!')
});

client.on('clientNotAdded', () => {
    console.log('Client already registered. Disconnected!')
});

// Displays the message in the format client:message
client.on('serverToClientMessage', (input) => {
  console.log(input.socketExp + ':' + input.message);
});

// Broadcast emit
client.on('broadcastAdded', (name) => {
    console.log('Client ' + name + ' was added!');
})

// The new client receives a list with the other clients
client.on('newAdded', (nameList) => {
    // Checks if there are other clients or if he's the first one
    if(nameList.length > 0)
        console.log('The other clients are: ' + nameList)
})

// Wrong format of the message
client.on('wrongFormat', (message) => {
    console.log(message);
});

// Client is disconnected
client.on('disconnectClient', (name) => {
    if(name) {
        console.log('Client ' + name + ' disconnected')
    }
});