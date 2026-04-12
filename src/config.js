const vscode = require('vscode');

/**
 * Reads all condaWingman.* settings.
 */
function getConfig() {
    const cfg = vscode.workspace.getConfiguration('condaWingman');
    return {
        showStatusBarItems: cfg.get('showStatusBarItems', true),
        autoSetInterpreter: cfg.get('autoSetInterpreter', true),
    };
}

module.exports = { getConfig };
