'use strict';

const Tag = require('./tag');

const Stmt = require('./inter/stmt');
const Seq = require('./inter/seq');

const Proto = require('./inter/proto');
const Syntax = require('./inter/syntax');
const Service = require('./inter/service');
const Message = require('./inter/message');
const Enum = require('./inter/enum');
const RPC = require('./inter/rpc');
const Field = require('./inter/field');
const EnumField = require('./inter/enum_field');
const MapField = require('./inter/map_field');
const Import = require('./inter/import');
const Option = require('./inter/option');
const Extensions = require('./inter/extensions');
const Range = require('./inter/range');

class Parser {
  constructor(lexer) {
    this.lexer = lexer;
    this.look = null;
    // 获取第一个 token
    this.move();
  }

  move() {
    this.look = this.lexer.scan();
    // skip comments
    while (this.look.tag === Tag.COMMENT) {
      this.look = this.lexer.scan();
    }
  }

  match(token) {
    if (this.look.tag === token) {
      this.move();
    } else {
      this.error(`expect ${token}`);
    }
  }

  error(message) {
    console.log(`${this.lexer.filename}:${this.lexer.line}`);
    console.log(`${this.lexer.source.split('\n')[this.lexer.line - 1]}`);
    console.log(`${' '.repeat(this.lexer.column - 1)}^`);
    var prefix = `unexpected token: ${this.look}.`;
    if (!message) {
      message = `${prefix}`;
    } else {
      message = `${prefix} ${message}`;
    }
    throw new SyntaxError(message);
  }

  program() {
    return this.proto();
  }

  proto() {
    var t = null;
    var token = this.look;
    if (token.tag === Tag.ID && token.lexeme === 'syntax') {
      t = this.syntax();
    }

    return new Proto(t, this.defines());
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
    // emptyStatement
    if (this.look.tag === ';') {
      return Stmt.Null;
    }

    if (this.look.tag === Tag.ID) {
      switch (this.look.lexeme) {
      case 'option':
        return this.option();
      case 'import':
        return this.import();
      case 'enum':
        return this.enum();
      case 'service':
        return this.service();
      case 'message':
        return this.message();
      case 'package':
        return this.package();
      }
    }

    // TODO: more defines

    this.error(`unexpected token ${this.look}`);
  }

  isWord(tag, lexeme) {
    return (this.look.tag === tag && this.look.lexeme === lexeme);
  }

  matchWord(tag, lexeme) {
    if (isWord(tag, lexeme)) {
      this.move();
    } else {
      this.error(`expect ID ${lexeme}.`);
    }
  }

  matchString(string) {
    if (this.look.tag === Tag.STRING && this.look.string === string) {
      this.move();
    } else {
      this.error(`expect String '${string}'.`);
    }
  }

  // syntax = "syntax" "=" quote "proto2" quote ";"
  syntax() {
    this.matchWord(Tag.ID, 'syntax');
    this.match('=');
    this.matchString('proto2');
    this.match(';');
    return new Syntax('proto2');
  }

  // import = "import" [ "weak" | "public" ] strLit ";"
  import() {
    this.matchWord(Tag.ID, 'import');
    var token = this.look;
    var modifier = null;
    if (token.tag === Tag.WEAK ||
      token.tag === Tag.PUBLIC) {
      modifier = token;
      this.move();
    }
    var path = this.look;
    this.match(Tag.STRING);
    this.match(';');
    return new Import(modifier, path);
  }

  // package = "package" fullIdent ";"
  package() {
    this.matchWord(Tag.ID, 'package');
    this.fullIdent();
    this.match(';');
  }

  // option = "option" optionName  "=" constant ";"
  // optionName = ( ident | "(" fullIdent ")" ) { "." ident }
  option() {
    this.matchWord(Tag.ID, 'option');
    var optionName = this.optionName();
    this.match('=');
    var value = this.constant();
    this.match(';');
    return new Option(optionName, value);
  }

  constant() {
    var value = this.look;
    // const
    if (value.tag === Tag.STRING || value.tag === Tag.BOOL) {
      this.move();
    } else {
      this.error();
    }
    return value;
  }

  // enum = "enum" enumName enumBody
  enum() {
    this.matchWord(Tag.ID, 'enum');
    var enumName = this.look;
    this.match(Tag.ID);
    this.match('{');
    var body = this.enumBody();
    this.match('}');
    return new Enum(enumName, body);
  }

  // enumBody = "{" { option | enumField | emptyStatement } "}"
  // enumField = ident "=" intLit [ "[" enumValueOption { ","  enumValueOption } "]" ]";"
  // enumValueOption = optionName "=" constant
  enumBody() {
    if (this.look.tag === '}') {
      return Stmt.Null;
    }

    if (this.look.tag === ';') {
      return Stmt.Null;
    }

    var t;
    if (this.look.tag === Tag.ID) {
      if (this.look.lexeme === 'option') {
        t = this.option();
      } else {
        // enumField = ident "=" intLit [ "[" enumValueOption { ","  enumValueOption } "]" ]";"
        var id = this.look;
        this.move();
        this.match('=');
        var value = this.look;
        this.match(Tag.NUMBER);
        var options = null;
        if (this.look.tag === '[') {
          this.match('[');
          options = this.enumOptions();
          this.match(']');
        }
        this.match(';');
        t = new EnumField(id, value, options);
      }
    } else {
      this.error();
    }

    return new Seq(t, this.enumBody());
  }

  enumOptions() {
    // enumValueOption { ","  enumValueOption }
    // enumValueOption = optionName "=" constant
    if (this.look.tag === ']') {
      return Stmt.Null;
    }

    if (this.look.tag === ',') {
      this.move();
    }

    var t;

    var optionName = this.optionName();
    this.match('=');
    var value = this.look;
    // const
    if (value.tag === Tag.STRING || value.tag === Tag.BOOL) {
      this.move();
    } else {
      this.error();
    }

    t = new Option(optionName, value);

    return new Seq(t, this.enumOptions());
  }

  optionName() {
    var tok;
    if (this.look.tag === Tag.ID) {
      tok = this.look;
      this.move();
    } else if (this.look.tag === '(') {
      this.move();
      tok = this.look;
      this.match(Tag.ID);
      this.match(')');
    } else {
      this.error();
    }

    while (this.look.tag === '.') {
      this.move();
      var id = this.look;
      this.match(Tag.ID);
      tok = new Seq(tok, id);
    }

    return tok;
  }

  // message = "message" messageName messageBody
  message() {
    this.matchWord(Tag.ID, 'message');
    var messageName = this.look;
    this.match(Tag.ID);
    this.match('{');
    var body = this.messageBody();
    this.match('}');
    return new Message(messageName, body);
  }

  // messageBody = "{" { field | enum | message | extend | extensions | group |
  // option | oneof | mapField | reserved | emptyStatement } "}"
  messageBody() {
    if (this.look.tag === '}') {
      return Stmt.Null;
    }

    if (this.look.tag === ';') {
      return Stmt.Null;
    }

    var t;
    var label;

    // label = "required" | "optional" | "repeated"
    // type = "double" | "float" | "int32" | "int64" | "uint32" | "uint64"
    //       | "sint32" | "sint64" | "fixed32" | "fixed64" | "sfixed32" | "sfixed64"
    //       | "bool" | "string" | "bytes" | messageType | enumType
    // fieldNumber = intLit;
    // field = label type fieldName "=" fieldNumber [ "[" fieldOptions "]" ] ";"
    // fieldOptions = fieldOption { ","  fieldOption }
    // fieldOption = optionName "=" constant
    if (this.look.tag === Tag.ID &&
      (this.look.lexeme === 'required' ||
      this.look.lexeme === 'optional' ||
      this.look.lexeme === 'repeated')) {
      label = this.look;
      this.move();
      var type = this.look;
      if (this.isWord(Tag.ID, 'group')) {
        // TODO
      } else if (this.look.tag === Tag.TYPE ||
        this.look.tag === Tag.ID) {
        this.move();
      }
      var fieldName = this.look;
      this.match(Tag.ID);
      this.match('=');
      var fieldNumber = this.look;
      this.match(Tag.NUMBER);
      var fieldOptions;
      if (this.look.tag === '[') {
        this.match('[');
        fieldOptions = this.fieldOptions();
        this.match(']');
      }
      this.match(';');
      t = new Field(label, type, fieldName, fieldNumber, fieldOptions);
    } else if (this.isWord(Tag.ID, 'map')) {
      t = this.mapField();
    } else if (this.isWord(Tag.ID, 'option')) {
      t = this.option();
    } else if (this.isWord(Tag.ID, 'message')) {
      t = this.message();
    } else if (this.isWord(Tag.ID, 'extensions')) {
      t = this.extensions();
    } else {
      this.error();
    }

    return new Seq(t, this.messageBody());
  }
  // mapField = "map" "<" keyType "," type ">" mapName "=" fieldNumber [ "[" fieldOptions "]" ] ";"
  // keyType = "int32" | "int64" | "uint32" | "uint64" | "sint32" | "sint64" |
  //           "fixed32" | "fixed64" | "sfixed32" | "sfixed64" | "bool" | "string"
  mapField() {
    this.matchWord(Tag.ID, 'map');
    this.match('<');
    var keyType = this.look;
    this.match(Tag.TYPE);
    this.match(',');
    var type = this.look;
    if (this.look.tag === Tag.ID || this.look.tag === Tag.TYPE) {
      this.move();
    } else {
      this.error();
    }
    this.match('>');
    var name = this.look;
    this.match(Tag.ID);
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
    return new MapField(keyType, type, name, fieldNumber, fieldOptions);
  }

  // fieldOptions = fieldOption { ","  fieldOption }
  fieldOptions() {
    if (this.look.tag === ',') {
      // skip ,
      this.move();
    }

    // fieldOption = optionName "=" constant
    if (this.look.tag !== Tag.ID) {
      return Stmt.Null;
    }

    var name = this.optionName();
    this.match('=');
    var value = this.constant();
    var option = new Option(name, value);

    return new Seq(option, this.fieldOptions());
  }

  extensions() {
    this.matchWord(Tag.ID, 'extensions');
    var ranges = this.ranges();
    this.match(';');
    return new Extensions(ranges);
  }

  ranges() {
    var range = this.range();
    while (this.look.tag === ',') {
      this.move();
      var r = this.range();
      range = new Seq(range, id);
    }
    return new Seq()
  }

  // intLit [ "to" ( intLit | "max" ) ]
  range() {
    var start = this.look;
    var end = null;
    this.match(Tag.NUMBER);
    var token = this.look;
    if (this.isWord(Tag.ID, 'to')) {
      this.move();
      if (this.isWord(Tag.ID, 'max')) {
        end = this.look;
        this.move();
      } else if (this.look.tag === Tag.NUMBER) {
        end = this.look;
        this.move();
      } else {
        this.error();
      }
    }

    return new Range(start, end);
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
      this.error();
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
      // emptyStatement
      t = Stmt.Null;
    }

    return new Seq(t, this.rpcExtra());
  }

  fullIdent() {
    var tok = this.look;
    this.match(Tag.ID);

    while (this.look.tag === '.') {
      this.move();
      var id = this.look;
      this.match(Tag.ID);
      tok = new Seq(tok, id);
    }

    return tok;
  }
}

module.exports = Parser;
