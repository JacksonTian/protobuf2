'use strict';

const path = require('path');
const fs = require('fs');

const Lexer = require('../lib/lexer');
const Parser = require('../lib/parser');

const argv = process.argv.slice(2);
const [ filename ] = argv;

if (!filename) {
  console.log('Usage:');
  console.log('    parser <filename>');
  process.exit(0);
}

const filePath = path.resolve(filename);
const source = fs.readFileSync(filePath, 'utf8');

var lexer = new Lexer(source, filePath);
var parser = new Parser(lexer);
var ast = parser.program();
console.log(JSON.stringify(ast, null, 2));
