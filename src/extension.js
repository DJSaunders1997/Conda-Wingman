// This file contains the main logic for the extension

const vscode = require("vscode"); // The module 'vscode' contains the VS Code extensibility API
const { execSync } = require("child_process");

// Import my VSCode command functions, utility/helper functions, and custom status bar.
const {
  buildCondaYAML,
  activateCondaYAML,
  writeRequirementsFile,
  deleteCondaEnv,
} = require("./commands");
const { showAllStatusBarItems, hideAllStatusBarItems } = require("./statusBarItems");
const { getConfig } = require("./config");

/**
 * Checks whether the `conda` CLI is available on PATH.
 * Shows a warning with install link if not found.
 */
function checkCondaAvailability() {
  try {
    const cmd = process.platform === 'win32' ? 'where conda' : 'which conda';
    execSync(cmd, { stdio: 'ignore' });
  } catch {
    vscode.window.showWarningMessage(
      'Conda Wingman: `conda` not found on PATH. Install Conda or Miniconda to use this extension.',
      'Install Conda'
    ).then(choice => {
      if (choice === 'Install Conda') {
        vscode.env.openExternal(vscode.Uri.parse('https://docs.conda.io/en/latest/miniconda.html'));
      }
    });
  }
}

/**
 * Function that is run on activation of extension.
 * Here the main functionality of the function is defined.
 *
 */
function activate(context) {
  console.log('Congratulations, your extension "Conda Wingman" is now active!');

  // Check conda is installed
  checkCondaAvailability();

  // Setup listener to see when active file is not YAML
  // Check whether to display the status bar items every time the active file changes.
  // Logic to check if the active file is a YAML file is in the status bar item class.
  const listener = vscode.window.onDidChangeActiveTextEditor(() => {
    if (getConfig().showStatusBarItems) {
      showAllStatusBarItems();
    }
  });

  context.subscriptions.push(listener);

  // Register VSCODE commands as functions defined in other files.
  const buildCommand = vscode.commands.registerCommand(
    "conda-wingman.buildCondaYAML",
    buildCondaYAML
  );
  const activateCommand = vscode.commands.registerCommand(
    "conda-wingman.activateCondaYAML",
    activateCondaYAML
  );
  const writeCommand = vscode.commands.registerCommand(
    "conda-wingman.writeRequirementsFile",
    writeRequirementsFile
  );
  const deleteCommand = vscode.commands.registerCommand(
    "conda-wingman.deleteCondaEnv",
    deleteCondaEnv
  );

  context.subscriptions.push(buildCommand, activateCommand, writeCommand, deleteCommand);

  // Show or hide status bar based on setting
  if (getConfig().showStatusBarItems) {
    showAllStatusBarItems();
  }

  // Listen for configuration changes
  const configListener = vscode.workspace.onDidChangeConfiguration(e => {
    if (e.affectsConfiguration('condaWingman.showStatusBarItems')) {
      if (getConfig().showStatusBarItems) {
        showAllStatusBarItems();
      } else {
        hideAllStatusBarItems();
      }
    }
  });
  context.subscriptions.push(configListener);
}

// this method is called when your extension is deactivated
function deactivate() {
  console.log('Extension "Conda Wingman" has been deactivated.');
}

module.exports = {
  activate,
  deactivate,
};
