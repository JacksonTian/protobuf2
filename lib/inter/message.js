'use strict';

const Stmt = require('./stmt');

class Message extends Stmt {
  constructor(name, body) {
    super();
    this.name = name;
    this.body = body;
  }
}

module.exports = Message;
