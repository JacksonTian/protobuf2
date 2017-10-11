'use strict';

module.exports = Object.freeze({
  STRING: 1,
  ID: 2,
  SYNTAX: 3,
  DEFINITION: 4, // service, message, enum
  RPC: 5, // rpc
  RETURNS: 6, // returns
  OPTION: 7, // option
  TYPE: 8, // string
  NUMBER: 9, // Number literal
  PUBLIC: 10, // public
  WEAK: 11, // weak
  IMPORT: 12, // import
  BOOL: 13, // true/false
});
