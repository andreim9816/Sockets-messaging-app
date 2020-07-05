const server = require("socket.io-client");
const client = server.connect("http://localhost:3000");

const readline = require('readline').createInterface(
    {
        input: process.stdin,
        output: process.stdout
    }
)

let currentName = "";

client.on('connect', () => {
    readline.question('Client conectat. Numele este: ', (nume) => {

        // numele clientului
        currentName = nume;

        // trimite serverului numele nou introdus
        client.emit('verificaNume', nume);

        // verifica daca numele exista deja. In caz afirmativ, se delogheaza
        client.on('adaugatNume', (added) => {

            if(added === false) {
                // clientul exista deja, se inchide conexiunea
                console.log("Numele exista deja!");
                client.close();
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
        client.emit('clientToServerMessage', { socketExp: currentName, readLineInput: input });
    })
})

client.on('serverToClientMessage', (input) => {
    // afiseaza mesajul in format(expeditor:mesaj)
  console.log(input.socketExp + ":" + input.mesaj);
})

// client.on('destNotExists', (numeDest) => {
//     // clientul respectiv nu exista
//     console.log('Clientul ' + numeDest + ' nu exista');
// })

client.on('broadcastAdded', (nume) => {
    // broadcast pentru toti clientii mai putin cel nou
    console.log(nume + " a fost adaugat!");
})

client.on('newAdded', (nameList) => {
    // clientul nou adaugat primeste o lista cu toti clientii
    if(nameList.length > 0)
        console.log("Numele celorlalti clienti este: " + nameList)
})

client.on('wrongFormat', (mesaj) => {
    console.log(mesaj);
});

client.on('disconnectClient', (nume) => {
    // clientul cu numele respectiv s-a deconectat
    console.log("Clientul " + nume + " s-a deconectat")
})