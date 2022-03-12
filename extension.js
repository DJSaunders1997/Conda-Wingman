// This file contains the main logic for the extension

// The module 'vscode' contains the VS Code extensibility API
const vscode = require('vscode');

// Terminal Functions copied from microsoft example terminal API
// https://github.com/microsoft/vscode-extension-samples/blob/main/terminal-sample/src/extension.ts
// Examples are given in TypeScript, so converted to JavaScript with an online converter https://extendsclass.com/typescript-to-javascript.html
// Function created by me to encapsulate the example terminalapi.sendText VSCode command
function sendCommandToTerminal(command) {

	// If there is no active terminal then create one
	// Then read in the active terminal for us to use
	var terminal = vscode.window.activeTerminal

	if (typeof terminal == 'undefined') {
		vscode.window.showInformationMessage('No active terminal found. Creating new terminal.')
		console.log('No active terminal found. Creating new terminal.')

		var terminal = vscode.window.createTerminal()
	}

	// Send command to active/new terminal
	terminal.show()	
	terminal.sendText(command)

	console.log(`Command '${command}' sent to terminal`)
}

// Helper function to check if active file is a YAML file
// Return true if active file is YAML
function activeFileIsYAML() {
	var activeFilename = vscode.window.activeTextEditor.document.fileName

	// split string by . and return last array element to get extension
	var fileExt = activeFilename.split('.').pop();

	if (fileExt.toLowerCase()=='yaml' || fileExt.toLowerCase()=='yml'){
		return true
	}
	else {
		return false
	}
}

// Deactivate extension if active window changes from a YAML file.
var listener = function (event) {
	console.log('Active window changed', event)

	// If file is not yaml then deactivate the extension
	if ( activeFileIsYAML() ){
		activate()

	}
	else {
		// TODO: Check if this does anything
		console.log('Deactivate extension as YAML file not in focus')

		icon.hide()
		deactivate()
	}

};

var subscription = vscode.window.onDidChangeActiveTextEditor(listener);
//subscription.dispose(); // stop listening for more active file changes

// Create Status Bar Icon
// Select Icons from this list https://code.visualstudio.com/api/references/icons-in-labels#icon-listing
var icon = vscode.window.createStatusBarItem('createEnvStatusBar',1)
icon.text = '$(flame)Create Env from YAML $(note)'
icon.color = 'Gold'
icon.tooltip = 'Click here to create a conda environment from the open YAML file'
icon.command = 'conda-wingman.buildCondaYAML'

function activate(context) {

	console.log('Congratulations, your extension "Conda Wingman" is now active!');

	icon.show() //TODO check file is yaml file

	// Build Conda Env Command
	// This command will build a conda environment from the file active in window.
	let buildCondaYAMLFunct = vscode.commands.registerCommand('conda-wingman.buildCondaYAML',
		function () {

			var activeFilename = vscode.window.activeTextEditor.document.fileName

			// Validate open file is YAML
			if( activeFileIsYAML() ) {
				var activeEditor = vscode.window.activeTextEditor;

				var filename = activeEditor.document.fileName

				console.log(`Filename is :${filename}`);

				// Convert file path \\ characters to /
				var filenameForwardSlash = filename.split('\\').join('/')
				console.log(`Amended filename is :${filenameForwardSlash}`);

				vscode.window.showInformationMessage(`Creating Env from ${filenameForwardSlash}\n This may take up to a minute...`);
				console.log(`Creating Env from ${filenameForwardSlash}\n This may take up to a minute...`)

				// Run the conda create environment command
				var command = `conda env create -f "${filenameForwardSlash}"`
				sendCommandToTerminal(command)

			}
			else {
				// split string by . and return last array element to get extension
				var fileExt = activeFilename.split('.').pop();
				vscode.window.showErrorMessage(`Cannot build conda env from a ${fileExt} file. Only YAML files are supported.`);
			}

		}
	);
	context.subscriptions.push(buildCondaYAMLFunct);

	// Command: "Conda Wingman: Update open YAML file from the active Conda Environment"
	// This command will update the open requirements.yaml with packages from the active environment.
	let updateCondaYAMLFunct = vscode.commands.registerCommand('conda-wingman.updateCondaYAML',
		function () {

			var activeFilename = vscode.window.activeTextEditor.document.fileName

			// Validate open file is YAML
			if( activeFileIsYAML() ) {
				var activeEditor = vscode.window.activeTextEditor;

				var filename = activeEditor.document.fileName

				console.log(`Filename is :${filename}`);

				// Convert file path \\ characters to /
				var filenameForwardSlash = filename.split('\\').join('/')
				console.log(`Amended filename is :${filenameForwardSlash}`);

				vscode.window.showInformationMessage(`Exporting active Conda environment to ${filenameForwardSlash} .`);
				console.log(`Exporting active Conda environment to ${filenameForwardSlash} .`)

				// Run the conda create environment command
				var command = `conda env export > "${filenameForwardSlash}"`
				sendCommandToTerminal(command)

			}
			else {
				// split string by . and return last array element to get extension
				var fileExt = activeFilename.split('.').pop();
				vscode.window.showErrorMessage(`Cannot export a conda env to a ${fileExt} file. Only YAML files are supported.`);
			}

		}
	);
	context.subscriptions.push(updateCondaYAMLFunct);


	// Command: "Conda Wingman: Create a YAML file from the active Conda Environment"
	// This command will create a requirements yaml to with a name input from the user.
	// TODO: Ask user for input and save as input.yaml.
	let createCondaYAMLFunct = vscode.commands.registerCommand('conda-wingman.createCondaYAML',
		function () {

			var activeFilename = vscode.window.activeTextEditor.document.fileName

			// Validate open file is YAML
			if( activeFileIsYAML() ) {
				var activeEditor = vscode.window.activeTextEditor;

				var filename = activeEditor.document.fileName

				console.log(`Filename is :${filename}`);

				// Convert file path \\ characters to /
				var filenameForwardSlash = filename.split('\\').join('/')
				console.log(`Amended filename is :${filenameForwardSlash}`);

				vscode.window.showInformationMessage(`Exporting active Conda environment to ${filenameForwardSlash} .`);
				console.log(`Exporting active Conda environment to ${filenameForwardSlash} .`)

				// Run the conda create environment command
				var command = `conda env export > "${filenameForwardSlash}"`
				sendCommandToTerminal(command)

			}
			else {
				// split string by . and return last array element to get extension
				var fileExt = activeFilename.split('.').pop();
				vscode.window.showErrorMessage(`Cannot export a conda env to a ${fileExt} file. Only YAML files are supported.`);
			}

		}
	);
	context.subscriptions.push(createCondaYAMLFunct);

}

// this method is called when your extension is deactivated
function deactivate() {
	icon.hide()
}

module.exports = {
	activate,
	deactivate
}
