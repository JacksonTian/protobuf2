'use strict';

const Stmt = require('./stmt');

class Proto extends Stmt {
  constructor(value, defines) {
    super();
    this.syntax = value;
    this.defines = defines;
  }

  gen(b, a) {

  }
}

module.exports = Proto;
