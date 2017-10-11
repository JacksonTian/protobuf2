'use strict';

const Stmt = require('./stmt');

class MapField extends Stmt {
  constructor(keyType, type, name, fieldNumber, fieldOptions) {
    super();
    this.keyType = keyType;
    this.type = type;
    this.name = name;
    this.fieldNumber = fieldNumber;
    this.options = fieldOptions;
  }
}

module.exports = MapField;
