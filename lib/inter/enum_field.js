'use strict';

const Stmt = require('./stmt');

class EnumField extends Stmt {
  constructor(id, value, options) {
    super();
    this.id = id;
    this.value = value;
    this.options = options;
  }
}

module.exports = EnumField;
