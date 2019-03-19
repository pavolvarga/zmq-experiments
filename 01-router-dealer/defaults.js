'use strict';

const PRODUCER_PORT = 10000;

const MSG_CHARACTER = 'a';

const SENDING_FREQUENCY = 100;

const MSG_SIZE = '10b';

const WORK_TYPE = 'none';

const PRODUCER_HOST = 'localhost';

const DEFAULTS = {
  PRODUCER_PORT,
  MSG_CHARACTER,
  SENDING_FREQUENCY,
  MSG_SIZE,
  WORK_TYPE,
  PRODUCER_HOST,
};

module.exports.DEFAULTS = DEFAULTS;
