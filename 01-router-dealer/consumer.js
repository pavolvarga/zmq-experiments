'use strict';

const
    {DEFAULTS} = require('./defaults'),
    {works} = require('./work');

const DOC = `

Consuming messages from ZMQ

Usage:
  consumer [--port <port>] [--work <work]

Options:
  -h --help             Print this help.
  -p --port <port>      TCP port for consumer. Default: ${DEFAULTS.PORT}.
  -w --work <work>      How much time to spend on a single message. This simulates processing of messages in real applications.
                        Possible values: ${works}. Values depends on user's hardware. Change implementations of methods in 'work.js'
                        for your own hardware.
`;

const
  // nodeReport = require('node-report'),
  zmq = require('zeromq'),
  {docopt} = require('docopt'),
  {work} = require('./work');

const
    opts = docopt(DOC, {version: '1.0'}),
    port = opts['--port'] ? opts['--port'] : DEFAULTS.PORT,
    workType = opts['--work'] ? opts['--work'] : DEFAULTS.WORK_TYPE;

const
  dealer = zmq.socket('dealer'),
  sndHwm = dealer.getsockopt(23),
  rcvHwm = dealer.getsockopt(24),
  sndBuf = dealer.getsockopt(11),
  rcvBuf = dealer.getsockopt(12);

console.log(`Consumer - Dealer Socket - sndHwm: ${sndHwm}, rcvHwm: ${rcvHwm}, sndBuf: ${sndBuf}, rcvBuf: ${rcvBuf}`);
console.log(`Port: ${port}, work: ${workType}`);

dealer.connect(`tcp://localhost:${port}`);

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
