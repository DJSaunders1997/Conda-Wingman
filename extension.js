// This file contains the main logic for the extension

// The module 'vscode' contains the VS Code extensibility API
const vscode = require('vscode');

// Required modules to read and parse yaml
// https://www.npmjs.com/package/js-yaml
const yaml = require('js-yaml');
const fs   = require('fs');

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

		createEnvIcon.hide()
		deactivate()
	}

};

var subscription = vscode.window.onDidChangeActiveTextEditor(listener);
//subscription.dispose(); // stop listening for more active file changes


/**
 * 
 * @returns the filepath of the open document
 * 
 * Reads the current open document, and converts the path into a more friendly format.
 * TODO: Find out what happens if there is no open document
 * TODO: make this OS agnostic, as I'm sure this only effects windows atm.
 */
function getOpenDocumentPath() {
	var activeEditor = vscode.window.activeTextEditor;
	var filename = activeEditor.document.fileName

	console.log(`Filename is :${filename}`);

	// Convert file path \\ characters to /
	var filenameForwardSlash = filename.split('\\').join('/')
	console.log(`Amended filename is :${filenameForwardSlash}`);

	return filenameForwardSlash
}

/**
 * 
 * @param {string} filenameForwardSlash : filename or path to yaml environment file.
 * 
 * Function will read the specified yaml file and pick out the "name" value.
 * Then attempts to activate this environment with the terminal.
 */
function activateEnvFromYAML(filenameForwardSlash) {
	// Send to terminal the command to activate the environment too
	// We can get the name by reading the YAML's value to the name: key using js-yaml
	try {
		const yamlDoc = yaml.load(fs.readFileSync(filenameForwardSlash, 'utf8'));
		console.log(yamlDoc);

		var env_name = yamlDoc["name"]

		vscode.window.showInformationMessage(`Activating ${env_name} .`);
		console.log(`Activating ${env_name} .`)

		// Run the conda create environment command
		var command = `conda activate ${env_name}`
		sendCommandToTerminal(command)

	} catch (e) {
		console.log("Error parsing the yaml")
		console.log(e);
	}

}


// TODO: Make this a function
// Create Status Bar Icon
// Select Icons from this list https://code.visualstudio.com/api/references/icons-in-labels#icon-listing
var createEnvIcon = vscode.window.createStatusBarItem('createEnvStatusBar',1)
createEnvIcon.text = '$(flame)Create Env from YAML $(note)'
createEnvIcon.color = 'Gold'
createEnvIcon.tooltip = 'Click here to create a conda environment from the open YAML file'
createEnvIcon.command = 'conda-wingman.buildCondaYAML'

function activate(context) {

	console.log('Congratulations, your extension "Conda Wingman" is now active!');

	createEnvIcon.show() //TODO check file is yaml file

	// Command: "Conda Wingman: Build Conda Environment from YAML file"
	// This command will build a conda environment from the file active in window.
	let buildCondaYAMLFunct = vscode.commands.registerCommand('conda-wingman.buildCondaYAML',
		function () {

			var activeFilename = vscode.window.activeTextEditor.document.fileName

			// Validate open file is YAML
			if( activeFileIsYAML() ) {
				
				var filenameForwardSlash = getOpenDocumentPath()

				// TODO: add $(loading~spin) onto status bar until after terminal has finished running command 
				vscode.window.showInformationMessage(`Creating Env from ${filenameForwardSlash}\n This may take up to a minute...`);
				console.log(`Creating Env from ${filenameForwardSlash}\n This may take up to a minute...`)

				// Run the conda create environment command
				var command = `conda env create -f "${filenameForwardSlash}"`
				sendCommandToTerminal(command)

				activateEnvFromYAML(filenameForwardSlash)

			}
			else {
				// split string by . and return last array element to get extension
				var fileExt = activeFilename.split('.').pop();
				vscode.window.showErrorMessage(`Cannot build conda env from a ${fileExt} file. Only YAML files are supported.`);
			}

		}
	);
	context.subscriptions.push(buildCondaYAMLFunct);

	// Command: "Conda Wingman: Activate Conda Environment from YAML file"
	// This command will activate the Conda environment named in the opened YAML file.
	let activateCondaYAMLFunct = vscode.commands.registerCommand('conda-wingman.activateCondaYAML',
	function () {

		var activeFilename = vscode.window.activeTextEditor.document.fileName

		// Validate open file is YAML
		if( activeFileIsYAML() ) {
			var filenameForwardSlash = getOpenDocumentPath()

			activateEnvFromYAML(filenameForwardSlash)
		}
		else {
			// split string by . and return last array element to get extension
			var fileExt = activeFilename.split('.').pop();
			vscode.window.showErrorMessage(`Cannot read conda env info from a ${fileExt} file. Only YAML files are supported.`);
		}

	}
);
context.subscriptions.push(activateCondaYAMLFunct);

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

	/**
	 * Shows an input box using window.showInputBox().
	 * Higher level wrapper around vscode.window.showInputBox
	 * Source: https://stackoverflow.com/questions/55854519/how-to-ask-user-for-username-or-other-data-with-vs-code-extension-api
	 */
	 async function createYAMLInputBox() {
		const result = await vscode.window.showInputBox({
			value: 'requirements.yml',
			placeHolder: 'Name of created conda environment YAML',
			validateInput: text => {
				// TODO: Figure out how this validation works and how I can use it.
				// vscode.window.showInformationMessage(`Validating: ${text}`);
			}
		});
		vscode.window.showInformationMessage(`Got: ${result}`);

		console.log("Running asynchronous createYAMLInputBox function ");

		//TODO: Maybe check the string isn't null before hand.
		// 		Or we let conda handel the validation for us in the terminal?

		vscode.window.showInformationMessage(`Creating YAML Env:\n'${result}' .`);
		console.log(`Creating YAML Env:\n'${result}' .`)

		// Run the conda create environment command
		var command = `conda env export > "${result}"`
		sendCommandToTerminal(command)

	}



	// Command: "Conda Wingman: Create a YAML file from the active Conda Environment"
	// This command will create a requirements yaml to with a name input from the user.
	// TODO: Ask user for input and save as input.yaml.
	let createCondaYAMLFunct = vscode.commands.registerCommand('conda-wingman.createCondaYAML',
		function () {

			// Get response from user as to which env they want to delete
			var response = createYAMLInputBox();
			console.log('Response: ', response);

			console.log(
				`While the createCondaYAMLFunct has finished running.
		The deleteInputBox function is still running in the background.`
			);

		}
	);
	context.subscriptions.push(createCondaYAMLFunct);

}

// this method is called when your extension is deactivated
function deactivate() {
	createEnvIcon.hide()
}

module.exports = {
	activate,
	deactivate
}
