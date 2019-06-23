'use strict';

const {DEFAULTS} = require('./defaults');

const DOC = `

Producing messages for ZMQ

Usage:
  producer [--port <port>] [--frequency <frequency>] [--size <size>]
  [--zmq-rcv-hwm <zmq-rcv-hwm>] [--zmq-snd-hwm <zmq-snd-hwm>] [--zmq-rcv-buf <zmq-rcv-buf>] [--zmq-snd-buf <zmq-snd-buf>]

Options:
  -h --help                     Print this help.
  -p --port <port>              TCP port for producer. Default: ${DEFAULTS.PRODUCER_PORT}.
  -f --frequency <frequency>    Frequency of sendinding messages in milliseconds. Default: ${DEFAULTS.SENDING_FREQUENCY} ms.
  -s --size <size>              Size of a messages. For example: 2.5kb. Allowed units are: b, kb, mb (both lower and upper case).
                                Default: ${DEFAULTS.MSG_SIZE}.
  --zmq-rcv-hwm <zmq-rcv-hwm>   New value for ZMQ_RCVHWM.
  --zmq-snd-hwm <zmq-snd-hwm>   New value for ZMQ_SNDHWM.
  --zmq-rcv-buf <zmq-rcv-buf>   New value for ZMQ_RCVBUF.
  --zmq-snd-buf <zmq-snd-buf>   New value for ZMQ_SNDBUF.
`;

const
  // nodeReport = require('node-report'),
  zmq = require('zeromq'),
  {docopt} = require('docopt'),
  {generateMsg} = require('./utils'),
  {parseZmqDocOptions, createSocket, readSocketOpts} = require('./utils');

const
  opts = docopt(DOC, {version: '1.0'}),
  {port, frequency, msgSize, zmqRcvHwm, zmqSndHwm, zmqRcvBuf, zmqSndBuf} = parseOpts(opts),
  msg = generateMsg(msgSize);

const
    router = createSocket('router', zmqRcvHwm, zmqSndHwm, zmqRcvBuf, zmqSndBuf),
    {readZmqRcvHwm, readZmqSndHwm, readZmqRcvBuf, readZmqSndBuf} = readSocketOpts(router);

console.log(`Versions [node: ${process.versions.node}, libuv: ${process.versions.uv}, v8: ${process.versions.v8}, zmq: ${zmq.version}]`);
console.log(`Producer (Router Socket) [port: ${port}, frequency: ${frequency}ms, msg size: ${msgSize}]`);
console.log(`Producer (Router Socket) [zmq-rcv-hwm: ${readZmqRcvHwm}, zmq-snd-hwm: ${readZmqSndHwm}, zmq-rcv-buf: ${readZmqRcvBuf}, zmq-snd-buf: ${readZmqSndBuf}]`);

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

function parseOpts(opts) {

  const
      port = opts['--port'] ? opts['--port'] : DEFAULTS.PRODUCER_PORT,
      frequency = opts['--frequency'] ? opts['--frequency'] : DEFAULTS.SENDING_FREQUENCY,
      msgSize = opts['--size'] ? opts['--size'] : DEFAULTS.MSG_SIZE,
      {zmqRcvHwm, zmqSndHwm, zmqRcvBuf, zmqSndBuf} = parseZmqDocOptions(opts);

  return {port, frequency, msgSize, zmqRcvHwm, zmqSndHwm, zmqRcvBuf, zmqSndBuf};
}

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
