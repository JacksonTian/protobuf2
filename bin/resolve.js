'use strict';

const path = require('path');
const fs = require('fs');

const argv = process.argv.slice(2);
const [ filename ] = argv;

if (!filename) {
  console.log('Usage:');
  console.log('    parser <filename>');
  process.exit(0);
}

const filePath = path.resolve(filename);
const source = fs.readFileSync(filePath, 'utf8');

const { parse } = require('../');

var ast = parse(source, filePath);
var resolved = ast.resolve();
console.log(JSON.stringify(resolved, null, 2));
