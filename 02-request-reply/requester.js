const zmq = require('zeromq');

//the 'client' part
console.log("Connecting to hello world server…");
const requester = zmq.socket('req');

requester.connect("tcp://localhost:5555");

for (let i = 0; i < 10; i++) {
    console.log("Sending request", i, '…');
    requester.send("Hello");
}

let x = 0;
requester.on("message", function(reply) {
    console.log("Received reply", x, ": [", reply.toString(), ']');
    x += 1;
    if (x === 10) {
        requester.close();
        process.exit(0);
    }
});


process.on('SIGINT', function() {
    requester.close();
});