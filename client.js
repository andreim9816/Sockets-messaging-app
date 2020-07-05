
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

        console.log(ioClient);
        // trimite serverului numele nou introdus
        ioClient.emit('verificaNume', nume);

        // verifica daca numele exista deja. In caz afirmativ, se delogheaza
        ioClient.on('adaugatNume', (added) => {

            if(added === false) {
                // clientul exista deja, se inchide conexiunea
                console.log("Numele exista deja!");
                ioClient.close();
                readline.close();
            }
            else {
                // clientul a putut fi adaugat
                console.log(nume + " a fost adaugat cu succes!")
            }
        })
    })

    readline.on('line', (input) => {
        // dupa ce s-a citit mesajul, se trimite catre server pentru prelucrare
        ioClient.emit('clientToServerMessage', { socketExp: currentName, readLineInput: input });
    })
})

ioClient.on('serverToClientMessage', (input) => {
    // afiseaza mesajul in format(expeditor:mesaj)
  console.log(input.socketExp + ":" + input.mesaj);
})

ioClient.on('destNotExists', (numeDest) => {
    // clientul respectiv nu exista
    console.log('Clientul ' + numeDest + ' nu exista');
})

ioClient.on('broadcastAdded', function(nume) {
    // broadcast pentru toti clientii mai putin cel nou
    console.log(nume + " a fost adaugat!");
})

ioClient.on('newAdded', function(nameList) {
    // clientul nou adaugat primeste o lista cu toti clientii
    if(nameList.length > 0)
        console.log("Numele celorlalti clienti este: " + nameList)
})

ioClient.on('disconnectClient', (nume) => {
    // clientul cu numele respectiv s-a deconectat
    console.log("Clientul " + nume + " s-a deconectat")
})