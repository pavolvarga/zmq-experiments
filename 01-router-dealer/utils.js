'use strict';

const
    zmq = require('zeromq'),
    {DEFAULTS} = require('./defaults'),
    {ZMQ_SNDHWM, ZMQ_RCVHWM, ZMQ_SNDBUF, ZMQ_RCVBUF} = require('./const');

function extractValues(val) {

  const
    lastButOneChar = val.charAt(val.length - 2),
    //b => 1, kb and mb => 2
    unitCharsCount = '0123456789'.includes(lastButOneChar) ? 1 : 2;

  const
    num = val.substring(0, val.length - unitCharsCount),
    unit = val.substring(val.length - unitCharsCount).toUpperCase();

  return {num, unit};
}

function translateUnit(unit) {
  switch (unit) {
    case 'B':
      return 1;
    case 'KB':
      return 1024;
    case 'MB':
      return 1024 * 1024;
    default:
      throw new Error(`Unsupported unit: ${unit}`);
  }
}

function generateMsg(val) {
  const
      {num, unit} = extractValues(val),
      count = num * translateUnit(unit);

  return DEFAULTS.MSG_CHARACTER.repeat(count);
}

function parseZmqDocOptions(opts) {

  const
    zmqRcvHwm = opts['--zmq-rcv-hwm'],
    zmqSndHwm = opts['--zmq-snd-hwm'],
    zmqRcvBuf = opts['--zmq-rcv-buf'],
    zmqSndBuf = opts['--zmq-snd-buf'];

  return {zmqRcvHwm, zmqSndHwm, zmqRcvBuf, zmqSndBuf};
}

function readSocketOpts(socket) {

  const
    readZmqRcvHwm = socket.getsockopt(ZMQ_RCVHWM),
    readZmqSndHwm = socket.getsockopt(ZMQ_SNDHWM),
    readZmqRcvBuf = socket.getsockopt(ZMQ_RCVBUF),
    readZmqSndBuf = socket.getsockopt(ZMQ_SNDBUF);

  return {readZmqRcvHwm, readZmqSndHwm, readZmqRcvBuf, readZmqSndBuf};
}

function createSocket(type, zmqRcvHwm, zmqSndHwm, zmqRcvBuf, zmqSndBuf) {

  const socket = zmq.socket(type);
  if (zmqRcvHwm) {
    socket.setsockopt(ZMQ_RCVHWM, parseInt(zmqRcvHwm, 10));
  }
  if (zmqSndHwm) {
    socket.setsockopt(ZMQ_SNDHWM, parseInt(zmqSndHwm, 10));
  }
  if (zmqRcvBuf) {
    socket.setsockopt(ZMQ_RCVBUF, parseInt(zmqRcvBuf, 10));
  }
  if (zmqSndBuf) {
    socket.setsockopt(ZMQ_SNDBUF, parseInt(zmqSndBuf, 10));
  }

  return socket;
}

module.exports.generateMsg = generateMsg;
module.exports.createSocket = createSocket;
module.exports.parseZmqDocOptions = parseZmqDocOptions;
module.exports.readSocketOpts = readSocketOpts;
