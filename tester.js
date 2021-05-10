const { join } = require('path');

const spawn = require('./spawn.js');
const Glob = require('./glob.js');
const { splitCmdLineArgs } = require('./utils.js');

function Tester(ws) {
	this.taskName;
	this.cmd;
	this.args;
	let defaultTesterScript = join(__dirname, 'impl/mocha-tester.js');
	let testConfig = ws.config.test;
	if (typeof testConfig === 'string' && testConfig.startsWith('@')) {
		// use a registered task as the test command
		this.taskName = testConfig.substring(1);

	} else if (testConfig) {
		if (testConfig.tester) {
			var cmdLine = splitCmdLineArgs(testConfig.tester);
			this.cmd = cmdLine.shift();
			this.args = cmdLine;
		} else { // use node and a test script
			this.cmd = 'node';
			this.args = [];
			if (testConfig.setup) {
				this.args.push('-r', testConfig.setup);
			}
			this.args.push(join(__dirname, 'test-runner.js'), testConfig.script || defaultTesterScript);
		}
	}
}

function runTests(cmd, args, cwd, testFiles) {
	var child = spawn(cmd, args, {
		stdio: ['pipe', 'inherit', 'inherit', 'ipc'],
		cwd: cwd
	});
	child.setInput(testFiles.join('\n'));
	return new Promise(function(resolve, reject) {
		child.promise.then(
			function(exitCode) {
				if (exitCode) {
					// tests failures
					reject(new Error('Got '+exitCode+' test failures'));
				} else {
					// tests passed
					resolve(exitCode);
				}
			}, function(err) {
				reject(err);
			}
		);
	});
}

Tester.prototype = {
	test: function(ws, project, args) {
		if (this.taskName) {
			// the builtin test task was replaced by a custom task
			let task = ws.tasks[this.taskName];
			if (!task) {
				throw new Error(`The 'test' task was repalced with a custom task named ${this.taskName} but this task was not registered`);
			}
			task(ws, project, args);
			return;
		}
		if (!this.cmd) {
			console.log("Skiping project", project.name, "- No tester declared");
			return;
		}
		if (!project.tests) {
			console.log("Skiping project", project.name, "- No tests declared");
		} else {
			var glob = Glob.create(project.tests);
			var testFiles = glob.match(project.root);
			if (testFiles && testFiles.length) {
				console.log('Running '+testFiles.length+' tests in', project.name);
				return runTests(this.cmd, this.args, ws.root, testFiles);
			} else {
				console.log("Skiping project", project.name, "- No tests found");
			}
		}
	}
}

module.exports = Tester;
