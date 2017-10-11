'use strict';

const Lexer = require('./lib/lexer');
const Parser = require('./lib/parser');

exports.parse = function (source, filePath) {
  var lexer = new Lexer(source, filePath);
  var parser = new Parser(lexer);
  return parser.program();
};
