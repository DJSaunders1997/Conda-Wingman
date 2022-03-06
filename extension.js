// This file contains the main logic for the extension

// The module 'vscode' contains the VS Code extensibility API
// The module 'execSync' is used to execute shell commands: https://stackoverflow.com/questions/1880198/how-to-execute-shell-command-in-javascript

const vscode = require('vscode');
const execSync = require('child_process').execSync;


function activate(context) {

	console.log('Congratulations, your extension "eggtension" is now active!');

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

	let buildCondaYAMLFunct = vscode.commands.registerCommand('eggtension.buildCondaYAML',
		function () {

			// https://stackoverflow.com/questions/53076566/visual-studio-code-extension-getting-active-tab-data-for-non-textual-files
			const activeEditor = vscode.window.activeTextEditor;

			var filename = activeEditor.document.fileName

			console.log(`Filename is :${filename}`);

			// Convert file path \\ characters to /
			var filenameForwardSlash = filename.split('\\').join('/')
			console.log(`Ammended filename is :${filenameForwardSlash}`);

			vscode.window.showInformationMessage(`Creating Env from ${filenameForwardSlash}\n This may take up to a minute...`);

			// Run the conda create environment command
			const terminal_output = execSync(`conda env create -f ${filenameForwardSlash}`, { encoding: 'utf-8' });
			console.log(`Creating env from file output:\n${terminal_output}`);

			//TODO: Get name of created environment and show to user
			vscode.window.showInformationMessage(`Conda environment created!`);

		}
	);
	context.subscriptions.push(buildCondaYAMLFunct);

}

module.exports = {
	activate
}
