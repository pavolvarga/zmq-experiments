'use strict';

const
    {DEFAULTS} = require('./defaults'),
    {works} = require('./work');

const DOC = `

Consuming messages from ZMQ

Usage:
  consumer [--port <port>] [--host <host>] [--work <work]
  [--zmq-hwm <zmq-hwm>] [--zmq-rcv-buf <zmq-rcv-buf>] [--zmq-snd-buf <zmq-snd-buf>]

Options:
  -h --help                     Print this help.
  -p --port <port>              Port for consumer to connect to. Default: ${DEFAULTS.PRODUCER_PORT}.
  -h --host <host>              Host for consumer to connect to. Default: ${DEFAULTS.PRODUCER_HOST}.
  -w --work <work>              How much time to spend on a single message. This simulates processing of messages in real applications.
                                Possible values: ${works}. Values depends on user's hardware. Change implementations of methods in 'work.js'
                                for your own hardware.
  --zmq-rcv-hwm <zmq-rcv-hwm>   New value for ZMQ_RCVHWM.
  --zmq-snd-hwm <zmq-snd-hwm>   New value for ZMQ_SNDHWM.
  --zmq-rcv-buf <zmq-rcv-buf>   New value for ZMQ_RCVBUF.
  --zmq-snd-buf <zmq-snd-buf>   New value for ZMQ_SNDBUF.
`;

const
  // nodeReport = require('node-report'),
  zmq = require('zeromq'),
  {docopt} = require('docopt'),
  {work} = require('./work'),
  {parseZmqDocOptions, createSocket, readSocketOpts} = require('./utils');

const
    opts = docopt(DOC, {version: '1.0'}),
    {port, host, workType, zmqRcvHwm, zmqSndHwm, zmqRcvBuf, zmqSndBuf} = parseOpts(opts);

const
  dealer = createSocket('dealer', zmqRcvHwm, zmqSndHwm, zmqRcvBuf, zmqSndBuf),
  {readZmqRcvHwm, readZmqSndHwm, readZmqRcvBuf, readZmqSndBuf} = readSocketOpts(dealer);

console.log(`Versions [node: ${process.versions.node}, libuv: ${process.versions.uv}, v8: ${process.versions.v8}, zmq: ${zmq.version}]`);
console.log(`Consumer (Dealer Socket) [host: ${host}, port: ${port}, work: ${workType}]`);
console.log(`Producer (Router Socket) [zmq-rcv-hwm: ${readZmqRcvHwm}, zmq-snd-hwm: ${readZmqSndHwm}, zmq-rcv-buf: ${readZmqRcvBuf}, zmq-snd-buf: ${readZmqSndBuf}]`);

dealer.connect(`tcp://${host}:${port}`);

let previousSeq = 0;

//send the 'start' message to producer
dealer.send(['', 'start']);

//accepts messages from producer
dealer.on('message', (...frames) => {

  const
    seq = parseInt(frames[1].toString(), 10),
    msg = frames[2].toString(),
    diff = seq - previousSeq;

  if (diff > 1) {
    console.log(`Missed msg count: ${diff}`);
  }

  console.log(`Received msg: ${seq}, length: ${msg.length}`);

  previousSeq = seq;

  work(workType);
});

//send the 'stop' message to producer and ends
process.on('SIGINT', () => {
  console.log('Consumer ends - got SIGINT signal');
  dealer.send(['', 'stop']);
  dealer.close();
  process.exit(0);
});
process.on('uncaughtException', (err) => {
  console.log('Consumer ends - error', err);
  dealer.send(['', 'stop']);
  dealer.close();
  process.exit(0);
});

function parseOpts(opts) {

  const
    port = opts['--port'] ? opts['--port'] : DEFAULTS.PRODUCER_PORT,
    host = opts['--host'] ? opts['--host'] : DEFAULTS.PRODUCER_HOST,
    workType = opts['--work'] ? opts['--work'] : DEFAULTS.WORK_TYPE,
    {zmqRcvHwm, zmqSndHwm, zmqRcvBuf, zmqSndBuf} = parseZmqDocOptions(opts);

  return {port, host, workType, zmqRcvHwm, zmqSndHwm, zmqRcvBuf, zmqSndBuf};
}
