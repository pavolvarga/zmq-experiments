const zmq = require('zeromq');

const subscriber = zmq.createSocket('sub');
subscriber.connect('tcp://localhost:5556')

if (process.argv.length !== 3) {
    console.log('run ass: node subscriber SUBSCRIBERS_ID');
    process.exit(1);
}

const
    subscriberId = parseInt(process.argv[2], 10),
    topic = `SUB-${subscriberId}`;

//subscribe to a 'topic'
//if topic does not exist, the subscriber will not receive any message
subscriber.subscribe(topic);

console.log(`Subscribed to topic ${topic}`);

subscriber.on('message', (msg) => {
    const
        parts = msg.toString().split(' '),
        address = parts[0],
        content = parts[1];

    console.log(`Subscriber for ${address} got message: ${content}`);
});

process.on('SIGINT', function() {
    subscriber.close();
    process.exit(0);
});
