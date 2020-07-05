'use strict';

const server = require('http').createServer();
const io = require('socket.io')(server);
const port = 3000;

server.listen(port, () => {
    console.log('Serverul a pornit pe portul: ' + port);
});

let socketsMap = new Map(); // mapare (nume -> Socket)

io.on('connection', (socket) => {
    // la conectare, se afiseaza un mesaj corespunzator
    console.log('Client conectat');

    // se verifica daca numele este deja luat
    socket.on('verificaNume', (nume) => {
        
        let added =  !socketsMap.has(nume);
        socket.emit('adaugatNume', added);

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
        //la deconectare, se afiseaza un mesaj corespunzator
        console.log("Client deconectat!");
        
        // gaseste numele socketului deconectat, pentru restul se emite un eveniment de deconectare
        let nume = getSocketNameById(socket.id);
        socket.broadcast.emit('disconnectClient', nume);
        socketsMap.delete(socket.nume);
    })

    socket.on('clientToServerMessage', (input) => {
        // clientul transmite serverului destinatarul si mesajul
        let inputArray = input.readLineInput.split(':');
        let mesaj = inputArray[1];

        if(inputArray.length > 1) {
            // format bun
            if(inputArray[0].trim().length == 0 || mesaj.length == 0) {
                socket.emit('wrongFormat', 'Numele destinatarului sau mesajul este vid');
            } else if(inputArray[0].trim() === 'broadcast') {
                // pentru broadcast, se emite un astfel de eveniment
                socket.broadcast.emit('serverToClientMessage', {socketExp: input.socketExp, mesaj : mesaj});
            } else {
                // nu este aleasa optiunea de broadcast
                if(socketsMap.has(inputArray[0].trim())) {
                    // daca destinatarul exista, se trimite mesajul
                    let socketDest = socketsMap.get(inputArray[0].trim());
                    socketDest.emit('serverToClientMessage', { socketExp: input.socketExp, mesaj : mesaj.trim()});
                }
                else {
                    // destinatarul nu exista, se trimite inapoi emitatorului un mesaj corespunzator
                    socket.emit('wrongFormat', 'Clientul ' + inputArray[0].trim() + ' nu exista');
                }
            }
        } else {
            // format gresit al mesajului
            socket.emit('wrongFormat', 'Format gresit');
        }
    })
});

function getSocketNameById(id) {
    // functie care primeste id-ul unui socket si returneaza numele
   for(let [key, value] of socketsMap.entries()) {
       if( value.id === id) {
           return key;
       }
   }
   return false;
}
