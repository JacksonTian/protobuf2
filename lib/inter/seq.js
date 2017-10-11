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

  resolve() {
    var right;
    if (this.stmt2 instanceof Seq) {
      right = this.stmt2.resolve();
    } else if (this.stmt2 === Stmt.Null) {
      right = [];
    } else {
      console.log(this.stmt2);
      right = [this.stmt2.resolve()];
    }
    return [this.stmt1.resolve(), ...right];
  }
}

module.exports = Seq;
