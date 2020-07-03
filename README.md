# Sockets-messaging-app

Using socket.io, implement a simple messaging application (no user interface required) that has the following features:

* when a client connects, it announces its identity to the server (username). If it fails to do so, the server will disconnect it after 2 seconds
* if the identity is already taken, the client is informed and disconnected
* if the identity is available, the server sends a broadcast to the connected clients (minus the new one), informing them about the fact that a new one joined. Moreover, the ..* server sends a list of connected clients to the newly connected one. This way, every client knows who is present in the chat room
* a client can send a message to another one, using its identity. Based on the identity, the server knows on which connection to send the message
 a client can send a message to all the other clients (broadcast)
* when a client disconnects, the server informs the remaining clients about this event
Implement the server using the socket.io server. Implement some test clients using the socket.io client.

Make use of the socket.io events to define each operation type. You can design the API anyway you want and can use any other module you think is useful.

## Dependencies

`npm install express`  
`npm install io.socket`  
`npm install socket.io-client`   
