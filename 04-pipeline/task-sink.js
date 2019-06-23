const
    zmq  = require('zeromq'),
    receiver = zmq.socket('pull');

let
    started = false,
    i = 0,
    label = "Total elapsed time";

receiver.on('message', function(msg) {

    // wait for start of batch
    if (!started) {
        console.time(label);
        started = true;
        console.log('Received 0 - started receiving data')

    }
    // process 10 confirmations
    else {
        i += 1;
        console.log(msg.toString());
        if (i === 10) {
            console.timeEnd(label);
            receiver.close();
            process.exit();
        }
    }
});

receiver.bindSync("tcp://*:5558");
