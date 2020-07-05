let server = require('http').createServer();
let io = require('socket.io')(server);
const port = 3000

const readline = require('readline').createInterface(
    {
        input: process.stdin,
        output: process.stdout
    }
)

let socketsMap = new Map();

io.on('connection', (socket) => {

    console.log('Client conectat');
    socket.on('verificaNume', (nume) => {
        
        let added =  !socketsMap.has(nume);
        socket.emit('adaugatNume', added)

        if(added === true) {
            /** in caz afirmativ, se trimite tuturor clientilor numele noului client
             *  iar cel nou primeste o lista cu numele tuturor clientilor
             */
            socket.emit('newAdded', Array.from(socketsMap.keys()));
            socket.broadcast.emit('broadcastAdded', nume);
            socketsMap.set(nume, socket);
        }
    })

    socket.on('disconnect', () => {
        console.log("Client deconectat!");
        
        // gaseste numele socketului deconectat, pentru restul se emite un eveniment de deconectare
        let nume = getSocketNameById(socket.id);
        socket.broadcast.emit('disconnectClient', nume);
        socketsMap.delete(socket.nume);
    })

    socket.on('clientToServerMessage', (input) => {

        let inputArray = input.readLineInput.split(':');
        let mesaj = inputArray[1];

        if(inputArray[0].trim() === 'broadcast') {
            // am ales opiunea de broadcast
            socket.broadcast.emit('serverToClientMessage', { socketExp: input.socketExp, mesaj : mesaj});
        }
        else {
            if(socketsMap.has(inputArray[0].trim())) {
                socketDest = socketsMap.get(inputArray[0].trim());
                socketDest.emit('serverToClientMessage', { socketExp: input.socketExp, mesaj : mesaj.trim()});
            }
            else {
                // clientul nu exista, se trimite inapoi emitatorului un mesaj corespunzator
                socket.emit('destNotExists', inputArray[0].trim());
            }
        }

    })
});

server.listen(port, () => {
    console.log('Serverul a pornit pe portul: ' + port);
});


function getSocketNameById(id) {
    // functie care primeste un socket si ii preia numele
   for(let [key, value] of socketsMap.entries()) {
       if( value.id === id) {
           return key;
       }
   }
   return false;
}