'use strict';

const Stmt = require('./stmt');

class Seq extends Stmt {
  constructor(stmt1, stmt2) {
    super();
    this.stmt1 = stmt1;
    this.stmt2 = stmt2;
  }

  gen(b, a) {

  }
}

module.exports = Seq;