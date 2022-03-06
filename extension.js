// This file contains the main logic for the extension

// The module 'vscode' contains the VS Code extensibility API
// The module 'execSync' is used to execute shell commands: https://stackoverflow.com/questions/1880198/how-to-execute-shell-command-in-javascript

const vscode = require('vscode');
const execSync = require('child_process').execSync;


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


		/**
	 * Shows an input box using window.showInputBox().
	 * Higher level wrapper around vscode.window.showInputBox
	 * Source: https://stackoverflow.com/questions/55854519/how-to-ask-user-for-username-or-other-data-with-vs-code-extension-api
	 */
		 async function showInputBox() {
			const result = await vscode.window.showInputBox({
				value: 'abcdef',
				valueSelection: [2, 4],
				placeHolder: 'For example: fedcba. But not: 123',
				validateInput: text => {
					vscode.window.showInformationMessage(`Validating: ${text}`);
					return text === '123' ? 'Not 123!' : null;
				}
			});
			vscode.window.showInformationMessage(`Got: ${result}`);
		}


	// Delete Conda Env Command
	// This command will delete a conda environment given the name of the environment from the user.
	let deleteCondaEnvFunct = vscode.commands.registerCommand('eggtension.deleteCondaEnv',
	function () {

		// TODO: Can I get the same list of python interpreters as used by the python extension?
		//	Then I could filter them down to only conda envs and will be more robust and prevent me from reinventing the wheel.
		// TODO list conda envs to use as dropdown / selection window
		// Run conda env list and parse results into a useable object / dict


		var response =  showInputBox("Test Input box");
		vscode.window.showInformationMessage(response);

		console.log(response);

		// TODO get response from user as to which env they want to delete

		// Delete that specific env (maybe deactivate first if that is the active env)

		console.log("TODO: This will delete a chosen conda env");

	}
);
context.subscriptions.push(deleteCondaEnvFunct);


}

module.exports = {
	activate
}
