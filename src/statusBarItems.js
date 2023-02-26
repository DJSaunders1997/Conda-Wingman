const vscode = require("vscode");
const { activeFileIsYAML } = require("./utils");

/**
 * Class to extend the vscode createStatusBarItem with additional functionality.
 * Represents the status bar that allows users to easily create environments.
 * Choose symbols from this list https://code.visualstudio.com/api/references/icons-in-labels#icon-listing
 */
class CustomStatusBarItem {
  constructor(defaultText, tooltip, command) {
    this.defaultText = defaultText;

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

    if (activeFileIsYAML) {
      this.statusBar.show();
    }
  }
  /**
   * To be displayed when action is running from the button being selected.
   *
   * TODO: Loading functionality doesn't work find a fix.
   */
  displayLoading() {
    this.statusBar.text = this.defaultText + " $(loading~spin)";

    if (activeFileIsYAML) {
      this.statusBar.show();
    }
  }
}

// Use CustomStatusBarItem class to create status bar items
// Export the object instances and not the class
// Create custom status bar items
var createEnvIcon = new CustomStatusBarItem(
  "$(tools) Build Env from YAML",
  "Build conda environment from open YAML file",
  "conda-wingman.buildCondaYAML"
);
var activateEnvIcon = new CustomStatusBarItem(
  "$(symbol-event) Activate Env from YAML",
  "Activate conda environment referenced in open YAML file",
  "conda-wingman.activateCondaYAML"
);
var writeEnvIcon = new CustomStatusBarItem(
  "$(book) Write Requirements File",
  "Write active conda environment to a YAML file",
  "conda-wingman.writeRequirementsFile"
);

module.exports = { createEnvIcon, activateEnvIcon, writeEnvIcon };