const vscode = require("vscode");
const yaml = require("js-yaml"); // Required modules to read and parse yaml https://www.npmjs.com/package/js-yaml
const fs = require("fs");

// Terminal Functions copied from microsoft example terminal API
// https://github.com/microsoft/vscode-extension-samples/blob/main/terminal-sample/src/extension.ts
// Examples are given in TypeScript, so converted to JavaScript with an online converter https://extendsclass.com/typescript-to-javascript.html
// Function created by me to encapsulate the example terminalapi.sendText VSCode command
function sendCommandToTerminal(command) {
  if (!command) return;

  // If there is no active terminal then create one
  // Then read in the active terminal for us to use
  let terminal = vscode.window.activeTerminal;

  if (!terminal) {
    console.log("No active terminal found. Creating new terminal.");
    terminal = vscode.window.createTerminal();
  }

  // Send command to active/new terminal
  terminal.show();
  terminal.sendText(command);
}

// Helper function to check if active file is a YAML file
// Return true if active file is YAML
function activeFileIsYAML() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return false;

  // split string by . and return last array element to get extension
  const fileExt = editor.document.fileName.split(".").pop();

  if (fileExt.toLowerCase() == "yaml" || fileExt.toLowerCase() == "yml") {
    return true;
  } else {
    return false;
  }
}

/**
 *
 * @param {string} filenameForwardSlash : filename or path to yaml environment file.
 *
 * Function will read the specified yaml file and pick out the "name" value.
 * @returns {string} The name of the environment.
 */
function getEnvNameFromYAML(filenameForwardSlash) {
  try {
    const yamlDoc = yaml.load(fs.readFileSync(filenameForwardSlash, "utf8"));

    const env_name = yamlDoc["name"];
    return env_name;
  } catch (e) {
    console.error("Error parsing the yaml", e);
    return null;
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
  const activeEditor = vscode.window.activeTextEditor;
  if (!activeEditor) return null;

  const filename = activeEditor.document.fileName;

  // Convert file path \\ characters to /
  const filenameForwardSlash = filename.split("\\").join("/");

  return filenameForwardSlash;
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
  const env_name = getEnvNameFromYAML(filenameForwardSlash);
  if (!env_name) {
    vscode.window.showErrorMessage("Error parsing the yaml");
    return;
  }

  console.log(`Activating ${env_name} .`);

  // Run the conda activate environment command
  const command = `conda activate ${env_name}`;
  sendCommandToTerminal(command);
}

/**
 *
 * @param {string} filenameForwardSlash : filename or path to yaml environment file.
 *
 * Function will read the specified yaml file and pick out the "name" value.
 * Then attempts to delete this environment with the terminal.
 */
function deleteEnvFromYAML(filenameForwardSlash) {
  const env_name = getEnvNameFromYAML(filenameForwardSlash);
  if (!env_name) {
    vscode.window.showErrorMessage("Error parsing the yaml");
    return;
  }

  console.log(`Deleting ${env_name} .`);

  // Env to be deleted can't be active when deleting
  // therefore deactivate any env first.
  const deactivateCommand = 'conda deactivate';
  sendCommandToTerminal(deactivateCommand);

  // Run the conda delete environment command
  const command = `conda env remove --name ${env_name}`;
  sendCommandToTerminal(command);
}

/**
 * Shows an input box using window.showInputBox().
 * Higher level wrapper around vscode.window.showInputBox
 * Source: https://stackoverflow.com/questions/55854519/how-to-ask-user-for-username-or-other-data-with-vs-code-extension-api
 */
async function createYAMLInputBox(defaultValue) {
  const result = await vscode.window.showInputBox({
    value: defaultValue,
    placeHolder: "Name of created conda environment YAML",
    validateInput: (text) => {
      if (text.length == 0) {
        return "You cannot leave this empty!";
      }
      const fileExt = text.split(".").pop().toLowerCase();

      if (fileExt != "yaml" && fileExt != "yml") {
        return `Only YAML files are supported!`;
      }
    },
  });

  if (result == undefined) {
    return;
  }

  console.log(`Creating requirements file Env:\n'${result}' .`);

  // Run the conda export environment command
  const command = `conda env export > "${result}"`;
  sendCommandToTerminal(command);
}

module.exports = {
  sendCommandToTerminal,
  activeFileIsYAML,
  getOpenDocumentPath,
  getEnvNameFromYAML,
  activateEnvFromYAML,
  createYAMLInputBox,
  deleteEnvFromYAML
};
