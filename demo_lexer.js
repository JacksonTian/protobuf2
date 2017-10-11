'use strict';

const path = require('path');
const fs = require('fs');

const Lexer = require('./lib/lexer');

const filePath = path.join(__dirname, 'test/figures/test2.proto3');
const source = fs.readFileSync(filePath, 'utf8');

var lexer = new Lexer(source, filePath);
var token;
do {
  token = lexer.scan();
  console.log(token.toString());
} while (token.tag);
