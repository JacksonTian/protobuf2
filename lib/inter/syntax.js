'use strict';

const Stmt = require('./stmt');

class Syntax extends Stmt {
  constructor(value) {
    super();
    this.value = value;
  }

  gen(b, a) {

  }
}

module.exports = Syntax;
