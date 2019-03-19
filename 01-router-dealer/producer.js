'use strict';

const {DEFAULTS} = require('./defaults');

const DOC = `

Producing messages for ZMQ

Usage:
  producer [--port <port>] [--frequency <frequency>] [--size <size>]

Options:
  -h --help                    Print this help.
  -p --port <port>             TCP port for producer. Default: ${DEFAULTS.PRODUCER_PORT}.
  -f --frequency <frequency>   Frequency of sendinding messages in milliseconds. Default: ${DEFAULTS.SENDING_FREQUENCY} ms.
  -s --size <size>             Size of a messages. For example: 2.5kb. Allowed units are: b, kb, mb (both lower and upper case).
                               Default: ${DEFAULTS.MSG_SIZE}.
`;

const
  // nodeReport = require('node-report'),
  zmq = require('zeromq'),
  {docopt} = require('docopt'),
  {generateMsg} = require('./utils');

const
  opts = docopt(DOC, {version: '1.0'}),
  port = opts['--port'] ? opts['--port'] : DEFAULTS.PORT,
  frequency = opts['--frequency'] ? opts['--frequency'] : DEFAULTS.SENDING_FREQUENCY,
  msgSize = opts['--size'] ? opts['--size'] : DEFAULTS.MSG_SIZE,
  msg = generateMsg(msgSize);

const
  router = zmq.socket('router'),
  sndHwm = router.getsockopt(23),
  rcvHwm = router.getsockopt(24),
  sndBuf = router.getsockopt(11),
  rcvBuf = router.getsockopt(12);

console.log(`Producer (Router Socket) [port: ${port}, frequency: ${frequency}ms, msg size: ${msgSize}]`);
console.log(`Producer (Router Socket) [sndHwm: ${sndHwm}, rcvHwm: ${rcvHwm}, sndBuf: ${sndBuf}, rcvBuf: ${rcvBuf}]`);

router.bind(`tcp://*:${port}`);

let
  identity,
  intervalId,
  seq = 1;

//wait for starting message
router.on('message', (...frames) => {

  const payload = frames[2].toString();

  identity = frames[0];

  console.log(`Producer got msg, identity: ${identity.toString('base64')}, payload: ${payload}`);

  switch (payload) {
    case 'start':
      start();
      break;
    case 'stop':
      stop();
      break;
    default:
      throw new Error(`Unknown payload: ${payload}`);
  }

});

function send() {
  console.log(`Sending: ${seq}, to identity: ${identity.toString('base64')}, length: ${msg.length}`);
  router.send([identity, '', seq++, msg]);
}

function start() {
  console.log('Producer started sending message');
  intervalId = setInterval(send, frequency);
}

function stop() {
  console.log('Producer received the stop message - producer ends');
  clearInterval(intervalId);
  router.close();
  process.exit(0);
}
