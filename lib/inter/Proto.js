'use strict';

const Stmt = require('./stmt');

class Proto extends Stmt {
  constructor(value) {
    super();
    this.syntax = value;
  }

  gen(b, a) {

  }
}

module.exports = Proto;
