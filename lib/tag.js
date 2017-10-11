'use strict';

module.exports = Object.freeze({
  STRING: 1,
  ID: 2,
  SYNTAX: 3,
  DEFINITION: 4, // service, message, enum
  RPC: 5, // rpc
  RETURNS: 6, // returns
  TYPE: 7, // string
  NUMBER: 8, // Number literal
  PUBLIC: 9, // public
  WEAK: 10, // weak
  IMPORT: 11, // import
  BOOL: 12, // true/false
  COMMENT: 13, // comment
});
