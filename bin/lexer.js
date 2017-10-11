'use strict';

const path = require('path');
const fs = require('fs');

const Lexer = require('../lib/lexer');

const argv = process.argv.slice(2);
const [ filename ] = argv;

if (!filename) {
  console.log('Usage:');
  console.log('    lexer <filename>');
  process.exit(0);
}

const filePath = path.resolve(filename);
const source = fs.readFileSync(filePath, 'utf8');

var lexer = new Lexer(source, filePath);
var token;
do {
  token = lexer.scan();
  console.log(token.toString());
} while (token.tag);
