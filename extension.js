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

function activate(context) {

	console.log('Congratulations, your extension "eggtension" is now active!');


	// Build Conda Env Command
	// This command will build a conda environment from the file active in window.
	// It first gets the name of the active file, removes escape character \\ and then runs "conda env create -f file"
	let buildCondaYAMLFunct = vscode.commands.registerCommand('eggtension.buildCondaYAML',
		function () {

			// TODO Add text / button to status bar that says something like "Create Env from file". Maybe with a snazzy logo too
			// similar to this https://marketplace.visualstudio.com/items?itemName=RoscoP.ActiveFileInStatusBar

			// https://stackoverflow.com/questions/53076566/visual-studio-code-extension-getting-active-tab-data-for-non-textual-files
			const activeEditor = vscode.window.activeTextEditor;

			// TODO: Validation that file ends in .yaml or .yml
			// If not exit function and show vscode information message saying "Cannot build conda env from a {fileExtension} file. Only YAML files are supported."
			var filename = activeEditor.document.fileName

			console.log(`Filename is :${filename}`);

			// Convert file path \\ characters to /
			var filenameForwardSlash = filename.split('\\').join('/')
			console.log(`Amended filename is :${filenameForwardSlash}`);

			vscode.window.showInformationMessage(`Creating Env from ${filenameForwardSlash}\n This may take up to a minute...`);
			console.log(`Creating Env from ${filenameForwardSlash}\n This may take up to a minute...`)

			// Run the conda create environment command
			var command = `conda env create -f ${filenameForwardSlash}`
			sendCommandToTerminal(command)

			// TODO: Show progress of creating env
			// https://stackoverflow.com/questions/43695200/how-to-implement-a-busy-indicator-in-vscode

		}
	);
	context.subscriptions.push(buildCondaYAMLFunct);


	/**
	 * Shows an input box using window.showInputBox().
	 * Higher level wrapper around vscode.window.showInputBox
	 * Source: https://stackoverflow.com/questions/55854519/how-to-ask-user-for-username-or-other-data-with-vs-code-extension-api
	 */
	async function deleteInputBox() {
		const result = await vscode.window.showInputBox({
			value: 'example_conda_env',
			placeHolder: 'Conda Environment Name to Delete',
			validateInput: text => {
				// TODO: Before this validation is called make another function that puts all conda env names into an array.
				// Then the validation here would be to make sure the input is an element of the array.
				vscode.window.showInformationMessage(`Validating: ${text}`);
				return text === '123' ? 'Not 123!' : null;
			}
		});
		vscode.window.showInformationMessage(`Got: ${result}`);

		console.log("Running asynchronous deleteInputBox function ");

		//TODO: Maybe check the string isn't null before hand.
		//TODO: Check theres no spaces / find a regex to validate valid env names
		//TODO: Check environment isn't currently active
		// Delete env

		// Run the conda create environment command
		// TODO: Add loading animation so users knows extension is still running.
		vscode.window.showInformationMessage(`Deleting Env:\n'${result}'\n This may take up to a minute...`);
		console.log(`Deleting Env:\n'${result}'\n This may take up to a minute...`)

		// Run the conda remove environment command
		var command = `conda env remove --name ${result}`
		sendCommandToTerminal(command)

		// If no errors / after try catch block
		// TODO: Verify that env no longer shows up in updated env list "conda info --envs"
		//	Or will more likely be using my own custom function for it
		vscode.window.showInformationMessage(`Conda environment ${result} deleted.`);
	}


	// Delete Conda Env Command
	// This command will delete a conda environment given the name of the environment from the user.
	// Deletes environments as stated in the conda docs https://docs.conda.io/projects/conda/en/latest/user-guide/tasks/manage-environments.html#removing-an-environment
	let deleteCondaEnvFunct = vscode.commands.registerCommand('eggtension.deleteCondaEnv',
		function () {

			// TODO: Can I get the same list of python interpreters as used by the python extension?
			//	Then I could filter them down to only conda envs and will be more robust and prevent me from reinventing the wheel.
			// TODO list conda envs to use as dropdown / selection window
			// Run conda env list and parse results into a useable object / dict


			var response = deleteInputBox("Test Input box");
			vscode.window.showInformationMessage(response);

			console.log(response);

			// TODO get response from user as to which env they want to delete

			// Delete that specific env (maybe deactivate first if that is the active env)

			console.log(
				`While the deleteCondaEnvFunction has finished running.
		The deleteInputBox function is still running in the background.`
			);

		}
	);
	context.subscriptions.push(deleteCondaEnvFunct);


}

module.exports = {
	activate
}
