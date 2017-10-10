'use strict';

const path = require('path');
const fs = require('fs');

const Lexer = require('./lib/lexer');
const Parser = require('./lib/parser');

const filePath = path.join(__dirname, 'test/figures/test.proto3');
const source = fs.readFileSync(filePath, 'utf8');

var lexer = new Lexer(source, filePath);
var parser = new Parser(lexer);
var ast = parser.program();
console.log(JSON.stringify(ast, null, 2));
