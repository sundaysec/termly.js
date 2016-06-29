(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports={
  "name": "browser-terminal.js",
  "version": "0.0.1",
  "description": "Simple Browser Terminal in pure js for presentational purpose",
  "main": "terminal.js",
  "scripts": {
    "start": "npm run build",
    "build": " browserify ./src/terminal.js -o ./terminal.js && uglifyjs terminal.js > terminal.min.js",
    "watch": "watchify ./src/terminal.js -o 'uglifyjs -cm > terminal.min.js' --verbose --debug"
  },
  "keywords": [
    "terminal",
    "javascript",
    "simulator",
    "browser",
    "presentation",
    "mockup",
    "commands",
    "fake"
  ],
  "author": "Simone Corsi",
  "license": "ISC",
  "devDependencies": {
    "axios": "^0.12.0",
    "browserify": "^13.0.1",
    "uglify-js": "^2.6.4",
    "watchify": "^3.7.0"
  }
}

},{}],2:[function(require,module,exports){
var package = require('../package.json');

var COMMANDS = {
  help: function () {
    var command_list = [];
    for(var key in this){
      if(this.hasOwnProperty(key)) command_list.push(key);
    }
    return command_list;
  },
  about: {
    name: package.name || '',
    version: package.version || '',
    author: package.author || '',
    repository: package.repository || '',
    license: package.license || '',
  },
  clear: function () {
    return "SGCLEAR";
  },
  exit: function () {
    return "SGEXIT";
  },
}

module.exports = COMMANDS;

},{"../package.json":1}],3:[function(require,module,exports){
(function (window, document, undefined) {
  var Terminal = {
    init: function ( terminal_container, custom_commands ) {
      this.Commands = require('./commands');
      if(custom_commands) this.addCustomCommands(custom_commands);
      this.terminal_container = terminal_container;
      this.generateRow( terminal_container );
      window.addEventListener('click', function () {
        document.getElementsByClassName('current')[0].children[1].focus();
      });
    },
    generateTerminalRow:function () {
      return '\
        <span class="term_head" style="color:lightgreen;">guest@'+ (location.hostname ? location.hostname : 'localhost') +' \
        ➜</span> \
        <input type="text" class="command_input" size="1" style="cursor:none;"> \
      ';
    },
    addCustomCommands:function (custom_commands) {
      for(var key in custom_commands){
        if(custom_commands.hasOwnProperty(key) && !this.Commands[key]){
          this.Commands[key] = custom_commands[key];
        }
      }
    },
    generateRow: function ( terminal_container ) {
      var that = this;
      var terminal_row, current, input;
      terminal_row = document.createElement('div');
      current = document.querySelectorAll(".current")[0];
      if(current){
        current.children[1].disabled = true;
        current.className = 'inner_terminal';
      }
      terminal_row.className = 'current inner_terminal';
      terminal_row.innerHTML = this.generateTerminalRow();
      terminal_container.appendChild(terminal_row);
      current = terminal_container.querySelector('.current');
      input = current.children[1];
      input.focus();
      input.addEventListener('keyup', that.consoleTypingHandler );
    },
    getSTDIN: function (command) {
      var res = this.parseCommand(command);
      if(!!res) this.sendSTDOUT(res);
    },
    sendSTDOUT: function (message, exit) {
      var res = document.createElement('pre');
      res.innerText = message;
      this.terminal_container.appendChild(res);
      if(!exit) this.generateRow(this.terminal_container);
    },
    parseCommand:function (command) {
      var that = this;
      var Commands = this.Commands;
      for(var key in Commands){
        if(Commands.hasOwnProperty(key) && command === key){
          var res = (typeof Commands[key] === 'function') ? JSON.stringify(Commands[key](), null, 2) : JSON.stringify(Commands[key], null, 2) ;
          switch (true) {
            case (typeof res === 'string' && res === '"SGEXIT"'):
              that.exitHandler();
              return null;
              break;
            case (typeof res === 'string' && res === '"SGCLEAR"'):
              that.clearHandler();
              return null;
              break;
            default:
              return res;
          }
        }
      }
      return "Command not found: type help for list of commands.";
    },
    exitHandler: function () {
      this.sendSTDOUT('Bye bye!', true);
      setTimeout(function () {
        location.reload();
      },1000)
    },
    clearHandler: function () {
      this.terminal_container.innerHTML = '';
      this.init( this.terminal_container ) ;
    },
    consoleTypingHandler: function (e) {
      var input = this;
      var size = input.size;
      var value = input.value;
      var key = e.which || e.keyCode;
      if (key === 13){
        Terminal.getSTDIN(input.value);
        return;
      }
      if( key >= 32 && key <= 126 ){
        input.size = value.length + 2;
      }
      if( key === 8){
        input.size = value.length ? value.length : 1;
      }
    },
  };
  window.Terminal = Terminal;
})(window, window.document)

},{"./commands":2}]},{},[3]);
