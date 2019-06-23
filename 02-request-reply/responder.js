const zmq = require('zeromq');

// the server part
const responder = zmq.socket('rep');

responder.bind('tcp://*:5555', function(err) {
    if (err) {
        console.log(err);
    } else {
        console.log("Listening on 5555…");
    }
});

responder.on('message', function(request) {
    console.log("Received request: [", request.toString(), "]");

    setTimeout(() => {
        // send reply back to client.
        responder.send("World");
    }, 1000);
});


process.on('SIGINT', function() {
    responder.close();
});
