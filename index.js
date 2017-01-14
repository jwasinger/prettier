"use strict";
const babylon = require("babylon");
const Printer = require("./src/printer").Printer;
const flowParser = require("flow-parser");
const comments = require("./src/comments");
const lineEndings = require("./src/le");

var babylonOptions = {
  sourceType: 'module',
  allowImportExportEverywhere: false,
  allowReturnOutsideFunction: false,
  plugins: [
    'jsx',
    'flow',
    'doExpressions',
    'objectRestSpread',
    'decorators',
    'classProperties',
    'exportExtensions',
    'asyncGenerators',
    'functionBind',
    'functionSent',
    'dynamicImport'
  ]
};

module.exports = {
  format: function(text, opts) {
    opts = opts || {};
    let ast;

    if(opts.useCRLF) {
      text = text.replace('\r' + '\n', '\n');
    }

    if(opts.useFlowParser) {
      ast = flowParser.parse(text);
      if(ast.errors.length > 0) {
        let msg = ast.errors[0].message + " on line " + ast.errors[0].loc.start.line
        if(opts.filename) {
          msg += " in file " + opts.filename;
        }
        throw new Error(msg);
      }
    }
    else {
      ast = babylon.parse(text, babylonOptions);
    }
    
    if(opts.useCLRF) {
      text = text.replace('\n', '\r' + '\n');
    }

    // Interleave comment nodes
    if(ast.comments) {
      comments.attach(ast.comments, ast, text);
      ast.comments = [];
    }
    ast.tokens = [];
    opts.originalText = text;

    const printer = new Printer(opts);
    return printer.printGenerically(ast).code;
  }
};
