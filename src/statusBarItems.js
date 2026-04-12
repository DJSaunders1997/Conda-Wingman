const vscode = require("vscode");
const { activeFileIsYAML, getEnvNameFromYAML } = require("./utils");
const { getCondaPythonVersion } = require("./interpreter");

/**
 * Class to extend the vscode createStatusBarItem with additional functionality.
 * Represents the status bar that allows users to easily create environments.
 * Choose symbols from this list https://code.visualstudio.com/api/references/icons-in-labels#icon-listing
 */
class CustomStatusBarItem {
  constructor(defaultText, tooltip, command) {
    this.defaultText = defaultText;
    this.loadingText = this.defaultText + " $(loading~spin)";

    this.statusBar = vscode.window.createStatusBarItem(); // createStatusBarItem('createEnvStatusBar',1)
    this.statusBar.text = defaultText;
    this.statusBar.tooltip = tooltip;
    this.statusBar.command = command;

    this.displayDefault();
  }

  /***
   * Returning text to default state.
   */
  displayDefault() {
    this.statusBar.text = this.defaultText;

    if (activeFileIsYAML()) {
      this.statusBar.show();
    } else {
      this.statusBar.hide();
    }
  }
  /**
   * To be displayed when action is running from the button being selected.
   * Currently not implemented as the terminal api does not allow us to view status.
   * TODO: Implement loading if the terminal api allows us to view status in future.
   */
  displayLoading() {
    this.statusBar.text = this.loadingText;
    this.statusBar.show();
  }
}

// Use CustomStatusBarItem class to create status bar items
// Export the object instances and not the class
// Create custom status bar items
const createEnvIcon = new CustomStatusBarItem(
  "$(tools) Build Env from YAML",
  "Build conda environment from open YAML file",
  "conda-wingman.buildCondaYAML"
);
const activateEnvIcon = new CustomStatusBarItem(
  "$(symbol-event) Activate Env from YAML",
  "Activate conda environment referenced in open YAML file",
  "conda-wingman.activateCondaYAML"
);
const writeEnvIcon = new CustomStatusBarItem(
  "$(book) Write Requirements File",
  "Write active conda environment to a YAML file",
  "conda-wingman.writeRequirementsFile"
);
//create custom status bar item to delete env
const deleteEnvIcon = new CustomStatusBarItem(
  "$(trashcan) Delete Env from YAML",
  "Delete conda environment referenced in open YAML file",
  "conda-wingman.deleteCondaEnv"
);

// Status bar item showing active conda env name and Python version.
// Clicking it opens the switch environment picker.
const envInfoItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
envInfoItem.command = "conda-wingman.switchEnvironment";
envInfoItem.tooltip = "Click to switch conda environment";
envInfoItem.text = "$(snake) conda: --";

/**
 * Reads the env name from the currently open YAML file and updates the
 * env info status bar item with the environment name and Python version.
 */
function updateEnvInfo() {
  const editor = vscode.window.activeTextEditor;
  if (!editor || !activeFileIsYAML()) {
    // Keep showing last known state, don't clear it
    return;
  }

  const filePath = editor.document.fileName;
  const envName = getEnvNameFromYAML(filePath);
  if (!envName) {
    envInfoItem.text = "$(snake) conda: --";
    return;
  }

  const version = getCondaPythonVersion(envName);
  if (version) {
    envInfoItem.text = `$(snake) conda: ${envName} (${version})`;
  } else {
    envInfoItem.text = `$(snake) conda: ${envName}`;
  }
}

// All items that participate in show/hide grouping
const allItems = [createEnvIcon, activateEnvIcon, writeEnvIcon, deleteEnvIcon];

function showAllStatusBarItems() {
  for (const item of allItems) {
    item.displayDefault();
  }
  envInfoItem.show();
  updateEnvInfo();
}

function hideAllStatusBarItems() {
  for (const item of allItems) {
    item.statusBar.hide();
  }
  envInfoItem.hide();
}

module.exports = {
  createEnvIcon, activateEnvIcon, writeEnvIcon, deleteEnvIcon,
  envInfoItem, showAllStatusBarItems, hideAllStatusBarItems, updateEnvInfo,
};
