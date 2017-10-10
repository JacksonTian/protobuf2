'use strict';

const Stmt = require('./stmt');

class Service extends Stmt {
  constructor(name, body) {
    super();
    this.name = name;
    this.body = body;
  }
}

module.exports = Service;
