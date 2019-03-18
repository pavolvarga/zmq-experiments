'use strict';

const worker = {

  work_none() {
    //do nothing
  },

  work_1s() {
    for(let i = 0; i < (10e8 + 10e7); i++) {
      //do nothing
    }
  },

  work_10s() {
    for(let i = 0; i < (10e9 - (2.9 * 10e8)); i++) {
      //do nothing
    }
  }

};

function work(type) {
  const method = worker[`work_${type}`];
  if (!method) {
    throw new Error(`Unknown work type: ${type}`);
  }
  method();
}


//use this for measuring work methods
//console.time('work');
//worker.work_();
//console.timeEnd('work');

module.exports.work = work;
module.exports.works = ['none', '1s', '10s'];
