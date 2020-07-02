let app = require('express')();
let server = require('http').createServer(app);
let io = require('socket.io')(server);
const port = 3000

const readline = require('readline').createInterface(
    {
        input: process.stdin,
        output: process.stdout
    }
)

let nameList = new Set(); // numele tutoror socketilor (tip String)
let sockets = []; // stocheaza toti socketii (e de tip Socket)

app.get('/', (req, res) => {
    res.send('');
});

io.on('connection', (socket) => {
    console.log('Client conectat');

    socket.on('verificaNume', (nume) => {
        let oldLength = nameList.size
        const nameListAux = Array.from(nameList)

        nameList.add(nume);

        let newLength = nameList.size

        let result =  oldLength !== newLength
        socket.emit('adaugatNume', result)

        if(result === true) {
            /** in caz afirmativ, se trimite tuturor clientilor numele noului client
             *  iar cel nou primeste o lista cu numele tuturor clientilor
             */

            socket.emit('newAdded', { nameList: Array.from(nameListAux) });
            sendBroadcastMessageMinusOne(socket, 'broadcastAdded', nume);
            sockets.push({ socket: socket, nume: nume })
        }

        socket.emit('mesaje')

    })

    socket.on('disconnect', () => {
        console.log("Client deconectat!");

        // gaseste numele socketului deconectat, pentru restul se emite un eveniment de deconectare
        let nume = getSocketNameById(socket.id)
        sockets = sockets.filter((obj) => { return obj.nume !== nume })
        sockets.forEach(obj => obj.socket.emit('disconnectClient', nume))

        // se updateaza lista cu numele clientilor ramasi
        let auxArray = Array.from(nameList)
        auxArray = auxArray.filter(value => value !== nume)
        nameList = new Set(auxArray)
    })

    socket.on('clientToServerMessage', (input) => {

        let inputArray = input.readLineInput.split(':');
        let mesaj = inputArray[1];

        if(inputArray[0].trim() === 'broadcast') {
            // am ales opiunea de broadcast
            sendBroadcastMessageMinusOne(socket, 'serverToClientMessage', { socketExp: input.socketExp, mesaj : mesaj});
        }
        else {
            let socketDest = getSocketByName(inputArray[0].trim());
            if(socketDest !== false) {
                // clientul exista, se trimite mesajul
                socketDest.emit('serverToClientMessage', { socketExp: input.socketExp, mesaj : mesaj.trim() })
            }
            else {
                // clientul nu exista, se trimite inapoi emitatorului un mesaj corespunzator
                let socket = getSocketByName(input.socketExp);
                socket.emit('destNotExists', inputArray[0].trim());
            }
        }

    })
});

server.listen(port, () => {
    console.log('listening on port: ' + port);
});


function getSocketNameById(id) {
    // functie care primeste un socket si ii preia numele

    for(let i = 0 ; i < sockets.length ; i++) {
        if (id === sockets[i].socket.id)
            return sockets[i].nume;
    }
    return false;
}


function getSocketByName(nume) {
    // functie care primeste numele unui socket si returneaza socketul respectiv

    for(let i = 0 ; i < sockets.length ; i++) {
        if (nume === sockets[i].nume)
            return sockets[i].socket;
    }
    return false;
}

function sendBroadcastMessageMinusOne(socket, optiune, param) {
    // functie care face emit pentru toti clientii mai putin unul << socket >>,  avand parametrul << param >>
    for(let obj of sockets) {
        if(obj.socket !== socket) {
            obj.socket.emit(optiune, param);
        }
    }
}