const zmq = require('zeromq');

const publisher = zmq.createSocket('pub');
publisher.bind("tcp://*:5556");

function randomNum() {
    return Math.round(Math.random() * 100);
}

function subscriberName(index) {
    return `SUB-${index}`;
}

if (process.argv.length !== 3) {
    console.log('run ass: node publisher SUBSCRIBERS_COUNT');
    process.exit(1);
}

const subscribersCount = parseInt(process.argv[2], 10);

//each 500 ms publish a message to one 'topic' in a round-robin way
//if a subscriber does not exist for the 'topic' the message will be discarded
let i = 1;
setInterval(() => {

    const
        message = randomNum(),
        topic = subscriberName(i);

    //message format:
    //address + empty frame + message itself
    publisher.send(topic + ' ' + message);
    i++;

    console.log(`Publisher send message: ${message} to topic: ${topic}`);

    //start again from the beginning
    if (i > subscribersCount) {
        i = 1;
    }

}, 500);

process.on('SIGINT', function() {
    publisher.close();
    process.exit(0);
});
