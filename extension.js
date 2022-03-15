// This file contains the main logic for the extension

// The module 'vscode' contains the VS Code extensibility API
const vscode = require('vscode');

// Required modules to read and parse yaml
// https://www.npmjs.com/package/js-yaml
const yaml = require('js-yaml');
const fs   = require('fs');

// Used to read and convert paths
var path = require('path');

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


/**
 * Class to extend the vscode createStatusBarItem with additional functionality.
 * Represents the status bar that allows users to easily create environments.
 * Choose symbols from this list https://code.visualstudio.com/api/references/icons-in-labels#icon-listing
 */
 class customStatusBarItem{
	constructor(defaultText, tooltip, command){
		this.defaultText = defaultText

		this.statusBar = vscode.window.createStatusBarItem() // createStatusBarItem('createEnvStatusBar',1)
		this.statusBar.text = defaultText
		this.statusBar.tooltip = tooltip
		this.statusBar.command = command
		
		this.displayDefault()
	}

	/***
	 * Returning text to default state.
	 */
	displayDefault() {
		this.statusBar.text = this.defaultText

		if (activeFileIsYAML) {
			this.statusBar.show()
		}
	}
	/**
	 * To be displayed when action is running from the button being selected.
	 * 
	 * TODO: Loading functionality doesn't work find a fix.
	 */
	displayLoading() {
		this.statusBar.text = this.defaultText + ' $(loading~spin)'

		if (activeFileIsYAML) {
			this.statusBar.show()
		}
	}

}


/**
 * Function that is run on activation of extension.
 * Here the main functionality of the function is defined.
 * 
 */
function activate(context) {

	console.log('Congratulations, your extension "Conda Wingman" is now active!');


	var createEnvIcon 	= new customStatusBarItem('$(tools) Build Env from YAML', 'Build conda environment from open YAML file', 'conda-wingman.buildCondaYAML')
	var activateEnvIcon = new customStatusBarItem('$(symbol-event) Activate Env from YAML', 'Activate conda environment referenced in open YAML file', 'conda-wingman.activateCondaYAML')
	var writeEnvIcon = new customStatusBarItem('$(book) Write Requirements File', 'Write active conda environment to a YAML file', 'conda-wingman.createCondaYAML')

	// Setup listener to see when active file is not YAML
	var listener = function (event) {
		console.log('Active window changed', event)

		// If file is not yaml then deactivate the extension
		if ( !activeFileIsYAML() ){
			createEnvIcon.hide()
			activateEnvIcon.hide()
			writeEnvIcon.hide()
		}

	};

	var fileChangeSubscription = vscode.window.onDidChangeActiveTextEditor(listener);
	//subscription.dispose(); // stop listening for more active file changes



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
				
				//Add loading icon to bar
				createEnvIcon.displayLoading()

				console.log("Display the loading bar")

				// Run the conda create environment command
				var command = `conda env create -f "${filenameForwardSlash}"`
				sendCommandToTerminal(command)

				activateEnvFromYAML(filenameForwardSlash)

				// Remove loading icon from bar
				createEnvIcon.displayDefault()
				console.log("Now remove the loading bar")
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

			activateEnvIcon.displayLoading()
			activateEnvFromYAML(filenameForwardSlash)

			//Remove loading icon from bar
			activateEnvIcon.displayDefault()
		}
		else {
			// split string by . and return last array element to get extension
			var fileExt = activeFilename.split('.').pop();
			vscode.window.showErrorMessage(`Cannot read conda env info from a ${fileExt} file. Only YAML files are supported.`);
		}

	}
	);
	context.subscriptions.push(activateCondaYAMLFunct);

	/**
	 * Shows an input box using window.showInputBox().
	 * Higher level wrapper around vscode.window.showInputBox
	 * Source: https://stackoverflow.com/questions/55854519/how-to-ask-user-for-username-or-other-data-with-vs-code-extension-api
	 */
	 async function createYAMLInputBox(defaultValue) {
		const result = 
		await vscode.window.showInputBox({
			value: defaultValue,
			placeHolder: 'Name of created conda environment YAML',
			validateInput: text => {
				if (text.length == 0){
					return 'You cannot leave this empty!'
				}
				var fileExt = text.split('.').pop().toLowerCase()

				if (fileExt!='yaml' && fileExt!='yml'){
					return(`Only YAML files are supported!`);
				}

			}
		});
		console.log("Running asynchronous createYAMLInputBox function ");
		
		console.log(`Got: ${result}`)
		if (result == undefined){
			vscode.window.showErrorMessage(`Cannot create requirements file if no name is given.`);
		}
		else {
			vscode.window.showInformationMessage(`Creating YAML Env:\n'${result}' .`);
			console.log(`Creating YAML Env:\n'${result}' .`)
	
			// Run the conda create environment command
			var command = `conda env export > "${result}"`
			sendCommandToTerminal(command)
		}
	}



	// Command: "Conda Wingman: Create a YAML file from the active Conda Environment"
	// This command will create a requirements yaml to with a name input from the user.
	// TODO: Ask user for input and save as input.yaml.
	let createCondaYAMLFunct = vscode.commands.registerCommand('conda-wingman.createCondaYAML',
		function () {

			writeEnvIcon.displayLoading()
			// Use current filename as default value if possible.
			var filepath = vscode.window.activeTextEditor.document.fileName
			var filename = path.parse(filepath).base;

			if (filepath == 'undefined' || !activeFileIsYAML()){
				filename = 'requirements.yml'
			}

			// Get response from user as to what to call their env.
			var response = createYAMLInputBox(filename);
			console.log('Response: ', response);
			
			console.log(
				`While the createCondaYAMLFunct has finished running.
				The createYAMLInputBox function is still running in the background.`
				);

			writeEnvIcon.displayDefault()
		}
	);
	context.subscriptions.push(createCondaYAMLFunct);

}

// this method is called when your extension is deactivated
function deactivate() {
	//fileChangeSubscription.dispose(); // stop listening for more active file changes
}

module.exports = {
	activate,
	deactivate
}
