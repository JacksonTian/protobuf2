'use strict';

const Stmt = require('./stmt');

class Import extends Stmt {
  constructor(modifier, path) {
    super();
    this.modifier = modifier;
    this.path = path;
  }
}

module.exports = Import;
