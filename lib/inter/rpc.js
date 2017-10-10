'use strict';

const Stmt = require('./stmt');

class RPC extends Stmt {
  constructor(rpcName, inputMessageType,
    inputMessageTypeStream, outputMessageType,
    outputMessageTypeStream, extra) {
    super();
    this.name = rpcName;
    this.inputMessageType = inputMessageType;
    this.inputMessageTypeStream = inputMessageTypeStream;
    this.outputMessageType = outputMessageType;
    this.outputMessageTypeStream = outputMessageTypeStream;
    this.extra = extra;
  }
}

module.exports = RPC;
