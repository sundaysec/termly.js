function syntaxHighlight(json) {
    if (typeof json != 'string') {
         json = JSON.stringify(json, undefined, 2);
    }
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
}

(function (window, document, undefined) {
  var Terminal = {
    init: function ( terminal_container, custom_commands ) {
      this.Commands = require('./commands');
      //this.filesystem = require('./filesystem');
      if(custom_commands) this.addCustomCommands(custom_commands);
      this.terminal_container = terminal_container;
      this.generateRow( terminal_container );
      window.addEventListener('click', function () {
        document.getElementsByClassName('current')[0].children[1].focus();
      });
    },
    generateTerminalRow:function () {
      var that = this;
      return '\
        <span class="term_head" style="color:lightgreen;">guest@'+ (location.hostname ? location.hostname : 'localhost') +' \
        ➜ '+ that.Commands.pwd() +' </span> \
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
      var argv = command.trim().split(" ");
      var res = this.parseCommand(argv);
      if(!!res) this.sendSTDOUT(res);
    },
    sendSTDOUT: function (message, exit) {
      var res = document.createElement('pre');
      res.innerText = message;
      this.terminal_container.appendChild(res);
      if(!exit) this.generateRow(this.terminal_container);
    },
    parseCommand:function (argv) {
      var that = this;
      var Commands = this.Commands;
      command = argv.shift();

      for(var key in Commands){
        if(Commands.hasOwnProperty(key) && command === key){
          var stdout;
          var res = (typeof Commands[key] === 'function') ? Commands[key]( argv.length ? argv : null ) : Commands[key] ;
          switch (true) {
            case (typeof res === 'string' && res === 'SGEXIT'):
              that.exitHandler();
              return null;
              break;
            case (typeof res === 'string' && res === 'SGCLEAR'):
              that.clearHandler();
              return null;
              break;
            case (typeof res === 'string'):
              stdout = res;
              break;
            case (typeof res === 'object' && Array.isArray(res)):
              stdout = res.join('\n');
              break;
            case (typeof res === 'object' && !Array.isArray(res)):
              stdout = JSON.stringify(res, null, 2);
              break;
            default:
              return res;
          }
          return stdout;
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
