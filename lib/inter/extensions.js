'use strict';

const Stmt = require('./stmt');

class Extensions extends Stmt {
  constructor(ranges) {
    super();
    this.ranges = ranges;
  }
}

module.exports = Extensions;
