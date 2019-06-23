const zmq = require('zeromq');

process.stdin.resume();

// Socket to send messages on
var sender = zmq.socket('push');
sender.bindSync("tcp://*:5557");

let
    i = 0,
    total_msec = 0;

function work() {
    console.log("Sending tasks to workers…");

    // The first message is "0" and signals start of batch
    sender.send("0");

    // send 10 tasks
    while (i < 10) {
        let workload = Math.abs(Math.round(Math.random() * 1000)) + 1;
        total_msec += workload;
        process.stdout.write(workload.toString() + "\n");
        sender.send(workload.toString());
        i++;
    }
    sender.close();
    process.exit();
};

console.log("Press enter when the workers are ready…");
process.stdin.on("data", function() {
    if (i === 0) {
        work();
    }
    process.stdin.pause();
});
