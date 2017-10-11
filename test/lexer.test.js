'use strict';

const expect = require('expect.js');

const Lexer = require('../lib/lexer');
const TokenCode = require('../lib/token');

function lex(source) {
  var lexer = new Lexer(source);
  var tokens = [];
  var token;
  do {
    token = lexer.scan();
    tokens.push(token);
  } while (token !== TokenCode.EOF);

  return tokens;
}

var source = `syntax = "proto3";

service Greeter {
    rpc SayHello (HelloRequest) returns (HelloReply) {}
}

message HelloRequest {
    string name = 1;
}

message HelloReply {
    string message = 1;
}`;

var tokens = lex(source);
console.log(tokens);

// describe('lexer', function () {

//   it('should ok', function () {
//     expect(lex(source)).to.eql(['I am ', '${', '@name', '}', 'End_Of_File']);
//   });

// });
