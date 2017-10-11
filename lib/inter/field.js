'use strict';

const Stmt = require('./stmt');

class Field extends Stmt {
  constructor(label, type, fieldName, fieldNumber, fieldOptions) {
    super();
    this.label = label;
    this.type = type;
    this.fieldName = fieldName;
    this.fieldNumber = fieldNumber;
    this.fieldOptions = fieldOptions;
  }
}

module.exports = Field;
