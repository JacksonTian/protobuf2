'use strict';

const Stmt = require('./stmt');

class Option extends Stmt {
  constructor(name, value) {
    super();
    this.name = name;
    this.value = value;
  }
}

module.exports = Option;
