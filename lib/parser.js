'use strict';

const Tag = require('./tag');

const Stmt = require('./inter/stmt');
const Seq = require('./inter/seq');

const Syntax = require('./inter/syntax');
const Service = require('./inter/service');
const Message = require('./inter/message');
const RPC = require('./inter/rpc');
const Field = require('./inter/field');

class Parser {
  constructor(lexer) {
    this.lexer = lexer;
    this.look = null;
    // 获取第一个 token
    this.move();
  }

  move() {
    this.look = this.lexer.scan();
  }

  match(token) {
    if (this.look.tag === token) {
      this.move();
    } else {
      this.error(`expect ${token}, but ${this.look}`);
    }
  }

  error(message) {
    console.log(`${this.lexer.filename}:${this.lexer.line}`);
    console.log(`${this.lexer.source.split('\n')[this.lexer.line - 1]}`);
    console.log(`${' '.repeat(this.lexer.column - 1)}^`);
    throw new SyntaxError(message);
  }

  program() {
    return this.proto();
  }

  proto() {
    var t = this.syntax();
    return new Seq(t, this.defines());
  }

  // proto = syntax { import | package | option | topLevelDef | emptyStatement }
  // topLevelDef = message | enum | service
  defines() {
    if (!this.look.tag) {
      return Stmt.Null;
    }

    return new Seq(this.define(), this.defines());
  }

  define() {
    if (this.look.tag === Tag.DEFINITION) {
      switch (this.look.lexeme) {
      case 'import':
        this.import();
        break;
      // case Tag.PACKAGE:
      //   this.package();
      //   break;
      // case Tag.OPTION:
      //   this.option();
      //   break;
      // case Tag.ENUM:
      //   this.enum();
      //   break;
      case 'service':
        return this.service();
      case 'message':
        return this.message();
      case ';':
        this.emptyStatement();
        break;
      default:
        this.error(`unexpected token ${this.look}`);
      }
    }
  }

  matchWord(tag, lexeme) {
    if (this.look.tag === tag && this.look.lexeme === lexeme) {
      this.move();
    } else {
      this.error(`expect ID ${lexeme}, but ${this.look}`);
    }
  }

  matchString(string) {
    if (this.look.tag === Tag.STRING && this.look.string === string) {
      this.move();
    } else {
      this.error(`expect String '${string}', but ${this.look}`);
    }
  }

  // syntax = "syntax" "=" quote "proto3" quote ";"
  syntax() {
    this.matchWord(Tag.SYNTAX, 'syntax');
    this.match('=');
    this.matchString('proto3');
    this.match(';');
    return new Syntax('proto3');
  }

  // import = "import" [ "weak" | "public" ] strLit ";"
  import() {

  }

  // package = "package" fullIdent ";"
  package() {

  }

  // option = "option" optionName  "=" constant ";"
  // optionName = ( ident | "(" fullIdent ")" ) { "." ident }
  option() {

  }

  // enum = "enum" enumName enumBody
  // enumBody = "{" { option | enumField | emptyStatement } "}"
  // enumField = ident "=" intLit [ "[" enumValueOption { ","  enumValueOption } "]" ]";"
  // enumValueOption = optionName "=" constant
  enum() {

  }

  // message = "message" messageName messageBody
  message() {
    this.matchWord(Tag.DEFINITION, 'message');
    var messageName = this.look;
    this.match(Tag.ID);
    this.match('{');
    var body = this.messageBody();
    this.match('}');
    return new Message(messageName, body);
  }

  // messageBody = "{" { field | enum | message | option | oneof | mapField |
  // reserved | emptyStatement } "}"
  messageBody() {
    if (this.look.tag === '}') {
      return Stmt.Null;
    }

    var t;

    if (this.look.tag === ';') {
      return Stmt.Null;
    }

    if (this.look.tag === Tag.OPTION) {

    } else if (this.look.tag === Tag.TYPE) {
      // field = [ "repeated" ] type fieldName "=" fieldNumber [ "[" fieldOptions "]" ] ";"
      // string name = 1;
      var type = this.look;
      this.move();
      var fieldName = this.look;
      // TODO: 保留字与普通 ID 重复的问题
      // this.match(Tag.ID);
      this.move();
      this.match('=');
      var fieldNumber = this.look;
      this.match(Tag.NUMBER);
      var fieldOptions = null;
      if (this.look.tag === '[') {
        this.match('[');
        fieldOptions = this.fieldOptions();
        this.match(']');
      }
      this.match(';');

      return new Field(type, fieldName, fieldNumber, fieldOptions);
    }

    return new Seq(t, this.messageBody());
  }

  // service = "service" serviceName serviceBody
  service() {
    this.matchWord(Tag.DEFINITION, 'service');
    var serviceName = this.look;
    this.match(Tag.ID);
    this.match('{');
    var body = this.serviceBody();
    this.match('}');
    return new Service(serviceName, body);
  }

  // serviceBody = "{" { option | rpc | emptyStatement } "}"
  serviceBody() {
    if (this.look.tag === '}') {
      return Stmt.Null;
    }

    var t;
    if (this.look.tag === Tag.RPC) {
      t = this.rpc();
    } else if (this.look.tag === ';') {
      t = Stmt.Null;
    } else if (this.look.tag === Tag.OPTION) {
      t = this.option();
    } else {
      this.error(`unexpected token: ${this.look}`);
    }

    return new Seq(t, this.serviceBody());
  }

  // rpc = "rpc" rpcName "(" [ "stream" ] messageType ")" "returns" "(" [ "stream" ]
  // messageType ")" (( "{" {option | emptyStatement } "}" ) | ";")
  rpc() {
    this.match(Tag.RPC);
    var rpcName = this.look;
    this.match(Tag.ID);
    this.match('(');

    var inputMessageTypeStream = false;
    // [ "stream" ]
    if (this.look.tag === Tag.STREAM) {
      inputMessageTypeStream = true;
      this.move();
    }

    var inputMessageType = this.look;
    this.match(Tag.ID);
    this.match(')');
    this.match(Tag.RETURNS);
    this.match('(');
    var outputMessageTypeStream = false;
    // [ "stream" ]
    if (this.look.tag === Tag.STREAM) {
      outputMessageTypeStream = true;
      this.move();
    }
    var outputMessageType = this.look;
    this.match(Tag.ID);
    this.match(')');

    var extra;
    // (( "{" {option | emptyStatement } "}" ) | ";")
    if (this.look.tag === ';') {
      extra = Stmt.Null;
    } else if (this.look.tag === '{') {
      this.match('{');
      extra = this.rpcExtra();
      this.match('}');
    }

    return new RPC(rpcName,
      inputMessageType, inputMessageTypeStream,
      outputMessageType, outputMessageTypeStream,
      extra);
  }

  // {option | emptyStatement }
  rpcExtra() {
    if (this.look.tag === '}') {
      return Stmt.Null;
    }

    var t;
    if (this.look.tag === Tag.OPTION) {
      t = this.option();
    } else if (this.look.tag === ';') {
      t = Stmt.Null;
    }

    return new Seq(t, this.rpcExtra());
  }

  // emptyStatement = ";"
  emptyStatement() {

  }
}

module.exports = Parser;
