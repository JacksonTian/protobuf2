'use strict';

const Stmt = require('./stmt');

class Range extends Stmt {
  constructor(start, end) {
    super();
    this.start = start;
    this.end = end;
  }
}

module.exports = Range;
