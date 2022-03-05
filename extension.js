// This file contains the main logic for the extension

// The module 'vscode' contains the VS Code extensibility API
// The module 'execSync' is used to execute shell commands: https://stackoverflow.com/questions/1880198/how-to-execute-shell-command-in-javascript

const vscode = require('vscode');
const execSync = require('child_process').execSync;


function activate(context) {

	console.log('Congratulations, your extension "eggtension" is now active!');

	// Function to run an example command
	let runCommandFunct = vscode.commands.registerCommand('eggtension.runCommand',
		function () {

			const output = execSync('dir', { encoding: 'utf-8' });  // the default is 'buffer'

			console.log('Output was:\n', output);
			vscode.window.showInformationMessage('Output was:\n', output);


		}
	);

	context.subscriptions.push(runCommandFunct);

	// Function to run an example command
	let runPipFreezeFunct = vscode.commands.registerCommand('eggtension.runPipFreeze',
		function () {

			// Run Pip freeze in terminal
			const output = execSync('pip freeze', { encoding: 'utf-8' });  // the default is 'buffer'

			console.log('Output was:\n', output);
			vscode.window.showInformationMessage('Output was:\n', output);
		}
	);
	context.subscriptions.push(runPipFreezeFunct);

	let runCondaEnvs = vscode.commands.registerCommand('eggtension.runCondaEnvs',
		function () {

			vscode.window.showInformationMessage('Running command: conda env list');

			// Run Pip freeze in terminal
			const output = execSync('\"conda env list\"', { encoding: 'utf-8' });

			console.log('Output was:\n', output);
			vscode.window.showInformationMessage('Output was:\n', output);
		}
	);
	context.subscriptions.push(runCondaEnvs);

	let runGetFileName = vscode.commands.registerCommand('eggtension.runGetFileName',
		function () {

			// const activeEditor: TextEditor = window.activeTextEditor;
			// if (activeEditor && activeEditor.document && activeEditor.document.fileName) {
			// 	return activeEditor.document.fileName;
			// }

			// https://stackoverflow.com/questions/53076566/visual-studio-code-extension-getting-active-tab-data-for-non-textual-files
			const activeEditor = vscode.window.activeTextEditor;

			var filename = activeEditor.document.fileName

			console.log(`Filename is :${filename}`);
			vscode.window.showInformationMessage(`Filename is :${filename}`);
		}
	);
	context.subscriptions.push(runGetFileName);



}

module.exports = {
	activate
}
