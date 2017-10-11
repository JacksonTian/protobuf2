'use strict';

class Stmt {
  constructor() {
    // this.after = 0;
  }

  gen(b, a) {

  }

  resolve() {
    return {
      type: this.constructor.name,
      value: this
    };
  }
}

Stmt.Null = new Stmt();

module.exports = Stmt;
