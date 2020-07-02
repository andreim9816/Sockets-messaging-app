
const io = require("socket.io-client");
const ioClient = io.connect("http://localhost:3000");

const readline = require('readline').createInterface(
    {
        input: process.stdin,
        output: process.stdout
    }
)

let currentName = "";

ioClient.on('connect', () => {
    readline.question('Client conectat. Numele este: ', (nume) => {

        // numele clientului
        currentName = nume;

        // trimite serverului numele nou introdus
        ioClient.emit('verificaNume', nume);

        // verifica daca numele exista deja. In caz afirmativ, se delogheaza
        ioClient.on('adaugatNume', (added) => {

            if(result === false) {
                console.log("Numele exista deja!");
                ioClient.close();
                readline.close();
            }
            else {
                console.log(nume + " a fost adaugat cu succes!")
            }
        })
    })

    readline.on('line', (input) => {
        ioClient.emit('clientToServerMessage', { socketExp: currentName, readLineInput: input });
    })
})

ioClient.on('serverToClientMessage', (input) => {
  console.log(input.socketExp + " : " + input.mesaj);
})

ioClient.on('destNotExists', (numeDest) => {
    console.log('Clientul ' + numeDest + ' nu exista');
})

ioClient.on('broadcastAdded', function(nume) {
    // broadcast pentru toti clientii mai putin cel nou
    console.log(nume + " a fost adaugat!\n");
})


ioClient.on('newAdded', function(obj) {
    // clientul nou adaugat primeste o lista cu toti clientii
    if(obj.nameList.length > 0)
        console.log("Numele celorlalti clienti este: " + obj.nameList)
})


ioClient.on('disconnectClient', (nume) => {
    // clientul cu numele respectiv s-a deconectat
    console.log("Clientul " + nume + " s-a deconectat")
})