'use strict';

const Stmt = require('./stmt');

class Field extends Stmt {
  constructor(repeated, type, fieldName, fieldNumber, fieldOptions) {
    super();
    this.repeated = repeated;
    this.type = type;
    this.fieldName = fieldName;
    this.fieldNumber = fieldNumber;
    this.fieldOptions = fieldOptions;
  }
}

module.exports = Field;
