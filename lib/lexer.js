'use strict';

const Tag = require('./tag');

const Token = require('./token');
const Word = require('./word');

class PBString extends Token {
  constructor(string) {
    super(Tag.STRING);
    this.string = string;
  }

  toString() {
    return `String: ${this.string}`;
  }
}

class PBNumber extends Token {
  constructor(value) {
    super(Tag.NUMBER);
    this.value = value;
  }

  toString() {
    return `Number: ${this.value}`;
  }
}

function isLetter(c) {
  if (typeof c !== 'string') {
    return false;
  }
  // letter = "A" … "Z" | "a" … "z"
  var code = c.charCodeAt(0);
  return (code >= 0x41 && code <= 0x5a ||
    code >= 0x61 && code <= 0x7a);
}

function isDecimalDigit(c) {
  if (typeof c !== 'string') {
    return false;
  }
  // decimalDigit = "0" … "9"
  var code = c.charCodeAt(0);
  return code >= 0x30 && code <= 0x39;
}

function isOctalDigit(c) {
  if (typeof c !== 'string') {
    return false;
  }
  // octalDigit   = "0" … "7"
  var code = c.charCodeAt(0);
  return code >= 0x30 && code <= 0x37;
}

function isHexDigit(c) {
  if (typeof c !== 'string') {
    return false;
  }
  // hexDigit     = "0" … "9" | "A" … "F" | "a" … "f"
  var code = c.charCodeAt(0);
  return (code >= 0x30 && code <= 0x39 ||
    code >= 0x41 && code <= 0x46 ||
    code >= 0x61 && code <= 0x66);
}

// ident = letter { letter | decimalDigit | "_" }
// fullIdent = ident { "." ident }
// messageName = ident
// enumName = ident
// fieldName = ident
// oneofName = ident
// mapName = ident
// serviceName = ident
// rpcName = ident
// messageType = [ "." ] { ident "." } messageName
// enumType = [ "." ] { ident "." } enumName

class Lexer {
  constructor(source, filename) {
    this.source = source;
    this.filename = filename;
    this.index = -1;
    this.peek = ' ';
    this.words = new Map();
    this.line = 1;
    this.column = 1;
    this.initReserveWords();
    console.log(...this.words);
  }

  initReserveWords() {
    // reserve words
    this.reserve(new Word('syntax', Tag.SYNTAX));

    this.reserve(new Word('message', Tag.DEFINITION));
    this.reserve(new Word('enum', Tag.DEFINITION));
    this.reserve(new Word('service', Tag.DEFINITION));

    this.reserve(new Word('rpc', Tag.RPC));
    this.reserve(new Word('returns', Tag.RETURNS));

    this.reserve(new Word('double', Tag.TYPE));
    this.reserve(new Word('float', Tag.TYPE));
    this.reserve(new Word('int32', Tag.TYPE));
    this.reserve(new Word('int64', Tag.TYPE));
    this.reserve(new Word('uint32', Tag.TYPE));
    this.reserve(new Word('uint64', Tag.TYPE));
    this.reserve(new Word('sint32', Tag.TYPE));
    this.reserve(new Word('sint64', Tag.TYPE));
    this.reserve(new Word('fixed32', Tag.TYPE));
    this.reserve(new Word('fixed64', Tag.TYPE));
    this.reserve(new Word('sfixed32', Tag.TYPE));
    this.reserve(new Word('sfixed64', Tag.TYPE));
    this.reserve(new Word('bool', Tag.TYPE));
    this.reserve(new Word('string', Tag.TYPE));
    this.reserve(new Word('bytes', Tag.TYPE));

    // this.reserve(new Word("else",  Tag.ELSE));
    // this.reserve(new Word("while", Tag.WHILE));
    // this.reserve(new Word("do",    Tag.DO));
    // this.reserve(new Word("break", Tag.BREAK));
    // this.reserve(new Word("var", Tag.BASIC));

    // this.reserve(Word.True);
    // this.reserve(Word.False);

    // this.reserve(Type.Int);
    // this.reserve(Type.Char);
    // this.reserve(Type.Bool);
    // this.reserve(Type.Float);
    // this.reserve(Definition.message);
    // this.reserve(Definition.enum);
    // this.reserve(Definition.service);
  }

  reserve(word) {
    this.words.set(word.lexeme, word);
  }

  // read a char
  getch() {
    this.index++;
    this.column++;
    this.peek = this.source[this.index]; // 其它返回实际字节值
  }

  scan() {
    this.skipWhitespace();

    switch (this.peek) {
    case '"':
      var str = '';
      for ( ; ; ) {
        this.getch();
        if (this.peek === '"') {
          this.getch();
          break;
        }

        if (this.peek) {
          str += this.peek;
        } else {
          throw new SyntaxError('Unexpect end of file');
        }
      }

      return new PBString(str);
    // // case ';':
    // //   return
    // case '=':
    //   return Word.eq;
    }


    // intLit     = decimalLit | octalLit | hexLit
    // decimalLit = ( "1" … "9" ) { decimalDigit }
    // octalLit   = "0" { octalDigit }
    // hexLit     = "0" ( "x" | "X" ) hexDigit { hexDigit }
    // hexDigit     = "0" … "9" | "A" … "F" | "a" … "f"
    if (isDecimalDigit(this.peek) && this.peek !== '0') {
      var v = '';
      do {
        v += this.peek;
        this.getch();
      } while (isDecimalDigit(this.peek));
      return new PBNumber(parseInt(v, 10));
    }

    if (isLetter(this.peek)) {
      let str = '';
      do {
        str += this.peek;
        this.getch();
      } while (isLetter(this.peek) ||
        isOctalDigit(this.peek) ||
        this.peek === '_');

      // reserve words
      if (this.words.has(str)) {
        return this.words.get(str);
      }

      var word = new Word(str, Tag.ID);
      this.words.set(str, word);
      return word;
    }

    var tok = new Token(this.peek);
    this.peek = ' ';
    return tok;
  }

  skipWhitespace() {
    // 忽略空格,和TAB ch =='\n'
    while (this.peek === ' ' || this.peek === '\t' ||
      this.peek === '\n' || this.peek === '\r') {
      if (this.peek === '\n') {
        // line number
        this.line++;
        this.column = 0;
      }
      this.getch();
    }
  }
}

module.exports = Lexer;
