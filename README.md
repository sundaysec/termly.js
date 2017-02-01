# Termly.js
### Simple, Extensible, Hackable and Lightweight Browser Terminal Simulator!

Want to showcase your new shiny CLI Tool you just released?\
Want to write HowTos on how some commands behaves?\
Want to create a simulated sandbox of linux-like commands to help people learn?\
You want to have fun (as I had) making your personal website readable from a fake terminal?\
Why not doing it interactively!

<div style="text-align:center" markdown="1">
	<h3>Using within a nice terminal css wrapper</h3>
  <img src="/termly.gif?raw=true" align="center" />
</div>
<div style="text-align:center" markdown="1">
	<h3>Using directly the main shell class and writing your own terminal wrapper</h3>
  <img src="/console.gif?raw=true" align="center" />
</div>

## Table of Content

+ [General Info](#General-and-why)
+ [Installing](#Installing)
+ [Getting Started](#Getting-Started)
+ [Basic Usage](#Basic-Usage)
+ [Options](#Options)
	+ [Filesystem Breakdown](#Filesystem-Object-Breakdown)
	+ [Commands Breakdown](#Commands-Object-Breakdown)
+ [Advanced Info](#Advanced-Usage)
+ [Developers](#Developers)

## General and why

Termly.js has no dependencies, is vanilla javascript and is lightweight `~11kb minified/gzipped` (with fetch/promise polyfill, otherwise less), it is transpiled with Babel to get the best possible browser support thus making it usable *almost* everywhere. You can use it as it is or hack it and rebuild it (Devs Info below).

**Why?** I did the first version as a joke for other Devs landing on my personal website to have something cool to do on it other than looking at boring list of skills and projects, someday I got caught in a refactoring spree and wanted to rewrite it to be more usable and extensible since I'm seeing a lot of people releasing cool and useful CLI Tools and it can somehow be helpful to show people not used to the terminal how to use your Tool or the terminal in general, may be helpful to someone who knows!


## Installing

Get the zip [Package](https://github.com/Kirkhammetz/termly.js/archive/master.zip) directly or better:

```sh
npm install termly.js
#	OR
yarn add termly.js
# OR
bower install termly.js
```

then in the `dist/` folder use either `termly.min.js` or `termly-prompt.min.js`, more on the difference below.


## Getting Started

Termly.js comes in two flavor:

- Shell Only `dist/termly.min.js`
- Prompt Wrapper on top of the Shell `termly-prompt.min.js`

**The Shell**  is the main class that init and build the simulated shell, you can provide a 'filesystem' and/or custom commands at instantiation to extend the defaults (I'll get on this below)

**The Prompt Wrapper** `termly-prompt.min.js` is a class on top of the Shell and extends it thus initializing the Shell as above but also providing the DOM I/O manipulation needed to interact with it (attaching to a container, generating input line, getting the input and sending to the shell to execute, generating an output line for the returned value), that leaves you to only deal with the CSS styling of the terminal.

<br />

## Basic Usage

Both the Shell and the Prompt wrapper can get parameters at instantiation whose most important are a custom Filesystem and a set of custom commands, both fall back to defaults if not provided.

**Using the Prompt Wrapper**

You can attach Termly.js to a DOM container and have it do the work of creating and setting up input/output field and handlers and only care of styling it, :
```html
<script src='dist/termly-prompt.min.js'></script>
<script>
	// Documentation for options in the next section
	var shell = new TermlyPrompt('#container', { /* options object */ })
</script>
```
*Keep in mind that the wrapper, while working and doing his job well, is very basic in doing it, it doesn't care about user experience or interface. This bring us to the next point the underling Shell Class.*

<br />

**Using the Shell Class**

A more advanced approach to build something custom that suites your needs would be to use Termly.js Shell Class, thus extending it with a wrapper and handle yourself all the DOM Input/Output in the way you desire it to behave.
```html
<script src='dist/termly.min.js'></script>
<script>
	// Documentation for options in the next section
	var shell = new Termly('#container', { /* options object */ })
	shell.run('help')
	//> 'Commands available: help, whoami, about, arguments, cd, ls, cat, man, http'
</script>
```
'Feeding' a command to the shell will return the command output in various format (String, Array, Object, Promise), and you will have to handle them in the way you want.

<br />

## Options

Both Termly.js constructors can take an Option object with the following:

|Option|Type|Defaults|
|---|---|---|
|filesystem| Object | Buildin Filesystem |
|commands| Object | Buildin Commands |
|user|  String | root |
|hostname|  String | my<span></span>.host.me |

<br />

## Filesystem Object Breakdown

Termly.js filesystem is build from a plain javascript object literal and every node is parsed in a `file` OR `directory` using those simple rules:

- **Directory**: the node's value is an `{Object}`
- **File**: the node's value is an `{Array}` or `{String}`
- **Discarted**: the node's value is `{Function}`

you can then simply pass the filesystem option
```js
var myFilesystem = {
	etc: {
		'file.1': 'My Content',
		anotherFile: ['A', 'List', 'Type', 'Of', 'file'],
		apache2: {
			'apache2.conf': 'Not what you were hoping for',
		},
	},
}
var shell = new TermlyPrompt('#container', { filesystem: myFilesystem })
```

<br />

## Commands Object Breakdown

Termly.js have a basic set of commands that you can extends at instantiation  using a plain javascript Object Literal with each property being another object with the command behavior, passing a command with the same key/name of a builtin override it that's intended.

<br />

#### Command Syntax
```js
 var customCommands = {
	 help: { // keep it equal to name till I change it
	 	name: 'help', // keep it equal to the key till I change it
	 	type: 'builtin', // OPTIONAL default to 'usr' if not passed
	 	man: 'List of available commands', // Manual Entry for the command OPTIONAL
	 	fn: function help(ARGV) {
			// Here is where the action goes, do what you want and return a value
			// (more on context and arguments below)
	 		return `Return the value of the command`
	 	},
	 },
	 // ...more commands
 }
 var shell = new TermlyPrompt('#container', { commands: customCommands })
```
**NB**
The property keys names the command, that's counter intuitive and may be changed. The key is used as the name when generating the inner commands list, which is a decorated object but starts as the options one, so the key/value pair is CommandName/CommandObject\
*eg*: as below is the key (help) that names the command, not the name property.

<br />

#### Command Function Execution

Every time the shell gets a command input (and the command exist) the `fn` of the command get executed, what return is handled back to the shell which check for errors or return the value. If no value is returned a message of Exit with no value is outputted.

You can `throw new Error('message')` in the function body, they are catched by the shell upstream and outputted as follow `-fatal {commandName}: {e.message}`

Every Command you create get a reference to the main shell object thus having all the access to the shell and its other object functions.
You can access the shell reference in the body function using `this.shell`.

*Keep in mind* that to use this you **MUST** write the function using its full syntax, you can of course use Arrow Function but you won't get the reference, plain simple.

<br />

#### Command Function Arguments Object

The arguments in the command input string are passed to each command (more on how are parsed later), the parser get a string in a linux-like format and parse in a more usable way. That mean that you can pass flags to your command and get it parsed as an object as the first argument of the `fn` of your command, you can test this using the buildin `arguments` command that output you command string as a parsed object.  

**ARGV object syntax**
|key|use|
|---|---|
|raw| Is the Raw command string parsed|
|command| Is the command name|
|_| Array of arguments which are not option flags ordered as seen |
|flag| flag value|

**Now an example speak better than thousands words**:

```bash
# standalone
arguments
#> {
#>   "raw": "arguments",
#>   "command": "arguments",
#>   "_": []
#> }

# with values
arguments value value2 value3
#> {
#>   "raw": "arguments value value2 value3",
#>   "command": "arguments",
#>   "_": [ "value", "value2", "value3" ]
#> }

# with flags
arguments -p flagValue value
#> {
#>   "raw": "arguments",
#>   "command": "arguments",
#>   "_": [ "value" ],
#>		"p": "flagValue",
#> }

# you got the point,
# with a full blown of brutal values
# (nested quotes are not implemented)
cmd -z -c -v -flag1 123 -p -f test --depth=0 -s --string=noquotes --flagstring="with spaces" source/ dest/
#> {
#>   "raw": "cmd -z -c -v -flag1 123 -p -f test --depth=0 -s --string=noquotes --flagstring="with spaces" source/ dest/",
#>   "command": 'cmd',
#>   "_": [ 'source/', 'dest/' ],
#>   "z": "true",
#>   "c": "true",
#>   "v": "true",
#>   "flag1": "123",
#>   "p": "true",
#>   "f": "test",
#>   "depth": "0",
#>   "s": "true",
#>   "string": 'noquotes',
#>   "flagstring": "with spaces"
#> }
```

#### More on how commands are parsed

Commands are parsed by a tinny parser I wrote for this project and was recently splitted into his own module, for testing and reusability, if you want to know more on how it work you can find it [HERE](https://github.com/Kirkhammetz/string-to-argv.js), you can use it standalone in case you need it.

But basically everything which starts with "-" or "--" is a flag, if no value after the flag, it's a boolean True flag, if there is a value the values is parsed as a string, if you need to pass a string with space you have to use the syntax `flat="stringed content"`, everything else is a standalone value passed to the `_` array. **NB** nested quotes don't work, I just write that plain simple.\

You now may be asking if you can write a json in a quoted string, yes you can but you have to write it as an object literal using string quotes and then parse it in your command, like in the [http](https://github.com/Kirkhammetz/termly.js/blob/master/bin/configs/builtin-commands.js#L167) builtin command.

## Advanced Usage

Both the Prompt Wrapper and the Shell expose some reference to all the other classes used so you can Extends it how you want it.
Commands as said before receive a reference to the shell so you can fiddle with it and create more advanced commands, even create command that create commands who create commands, command-ception.

The Prompt Wrapper directly inherit from the Shell so everything available there is available to the Prompt class too.

If you choose to use the Shell only package after instantializing the object you will have the `run()` method exposed to send commands to the shell.

Mind that every command sent have a returned value, I didn't implement node EventEmitter to keep it simple and lightweight but could be done easily if you want to change it.

The shell come bundled with a polyfill for the fetch method and one for promise, I didn't want to bundle a full HTTP library to keep it lightweight and simple, anyway if you use the Shell class and you do HTTP calls in one of you command you must check the return and if it is a promise await it.
Or implement an EventEmitter in the Shell Class and do something more fine-tuned.

## Developers

#### Project Structure

**Classes Inheritance**
|main|Class|Parent|
|---|---|---|
|true|Prompt|Shell|
|true|Shell|Interpreter|
||Interpreter||
||Filesystem||
||File||
||Command||

The Main Class is `Shell.js`, `Prompt.js` is the DOM wrapper which inherits from it, thus making two different bundle.

`Shell` class have in it **references** to other class for your usage
+ Classes
	+ Command
	+ File
+ fs: is a reference to the Filesystem instantiated with the shell and all its methods

`Command` class have a `shell` reference to navigate around in `this.shell`, it's passed when command are instantiated, also commands bind the this context of the function to the command class making it access the shell reference.

#### Methods & Properties
#####Shell
- `@method run` the shell expose this method that gets a string and pass it to the interpreter

- `@property ShellCommands` Commands Generated list, that's where execute will check for commands to execute
- `@property fs` The Virtual Filesystem generated reference
- `@property user` fake user
- `@property hostname` fake hostname

#####Interpreter
- `@method exec` Get the command string from the shell `run` method, check for error to throw, send command to be parsed by `parse()`, find the command if exist and call its execute function, returning the output
- `@method parse` Get a command string, pass it to the Parser module and return an `{Object}`
- `@method format` Check if command output is a valid format, and return it, more checks or transformation can be done here
- `@method registerCommands` this is called at instantiation passing all the commands builtin + user custom ones returning an object with all the commands which is in

#####Filesystem
- `@property shell` the main shell instance reference
- `@property FileSystem` The generated fake Filesystem
- `@property cwd` current workign directory in array format

- `@method initFs` get the Filesystem object and delegate it's creation, then returning it to the caller
- `@method buildVirtualFs` traverse the object and recreate the FS using the File Class
- `@method pathStringToArray` get a path as a string and turn to an array
- `@method pathArrayToString` get a path as a array and turn to an string
- `@method fileWalker` Recursive Virtual Filesystem File Walker, return the node found if any.
- `@method traverseFiles` traverse the FS all files (not directory) at least once, and call the callback provided on it, if any
- `@method traverseDirs` traverse the FS all directory at least once, and call the callback provided on it, if any
- `@method getNode` given a path and a filetype call fileWalker to find it, if found return file/dir as asked, its path as string and array
- `@method changeDir` builtin change directory command, used by CD command
- `@method listDir` builtin list directory command, used by LS command
- `@method readFile` builtin to read file value content, used by CAT command
- `@method getCurrentDirectory` return the current working dir as a string

#####File
- `@property uid` fake uid generated at instantiation
- `@property name` file name
- `@property type` file type, file|dir
- `@property content` content, can be value or another object, wich mean is a directory
- `@property user` fake owner
- `@property group` fake group
- `@property permission` fake permission

- `@method genUid` generate random UID just for the sake of it

#####Command

- `@method exec` execute command function passing arguments if the caller commands has any

- `@property fn` command function provided by user at creation, gets THIS binded to Command Class
- `@property name` name
- `@property type` fake type
- `@property man` manual entry used by MAN command
- `@property shell` shell instance reference

#### Running the tests

Tests are done with Mocha/Chai using expect, you can run them with `npm test`.

#### Source Build

The sources are written using ES6 Classes and built with babel bundled with webpack2.\
You can build it using `npm run build` which will run with production flag set\
or `npm run build:dev` which will run with a watcher for file changes a no production flag

## Built Using

* [Babel](https://babeljs.io/) - For ES2015 transpilation
* [Webpack](https://webpack.js.org/) - Bundling
* [Mocha](https://mochajs.org/) - Testing
* [Chai](http://chaijs.com/) - Testing

## Contributing

Fell free to let me know if there are any issue.

## Authors

* **Simone Corsi** - *Initial work* - [Kirkhammetz](https://github.com/Kirkhammetz)

## Acknowledgments

Got some inspiration from [minimist](https://github.com/substack/minimist) module but that has more functions that I needed, kudos btw :)

Promise Polyfill https://github.com/taylorhakes/promise-polyfill

Fetch API Polyfill https://github.com/github/fetch

Some CSS I got here and there for the demo, I really don't remember where sorry :(

## License

This project is licensed under the GNU GPL v3 License - see the [LICENSE.md](LICENSE.md) file for details
