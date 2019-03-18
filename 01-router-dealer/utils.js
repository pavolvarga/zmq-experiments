'use strict';

const {DEFAULTS} = require('./defaults');

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

module.exports.generateMsg = generateMsg;
