const vscode = require("vscode");
const path = require("path");
const { execSync } = require("child_process");

const {
  sendCommandToTerminal,
  activeFileIsYAML,
  getOpenDocumentPath,
  activateEnvFromYAML,
  deleteEnvFromYAML,
  createYAMLInputBox,
} = require("./utils");
const { getCondaInterpreterPath, setWorkspacePythonInterpreter } = require("./interpreter");
const { getConfig } = require("./config");
const {
  activateEnvIcon,
  writeEnvIcon,
  deleteEnvIcon,
} = require("./statusBarItems");

function buildCondaYAML() {
  const filenameForwardSlash = getOpenDocumentPath();

  if (activeFileIsYAML()) {
    vscode.window.showInformationMessage(
      `Creating Env from ${filenameForwardSlash}\n This may take up to a minute...`
    );
    console.log(
      `Creating Env from ${filenameForwardSlash}\n This may take up to a minute...`
    );

    const createEnvCommand = `conda env create -f "${filenameForwardSlash}"`;
    sendCommandToTerminal(createEnvCommand);

    activateEnvFromYAML(filenameForwardSlash);
  } else {
    const activeFilename = vscode.window.activeTextEditor.document.fileName;
    const fileExt = activeFilename.split(".").pop();
    vscode.window.showErrorMessage(
      `Cannot build conda env from a ${fileExt} file. Only YAML files are supported.`
    );
  }
}

function activateCondaYAML() {
  const filenameForwardSlash = getOpenDocumentPath();

  const activeFilename = vscode.window.activeTextEditor.document.fileName;

  // Validate open file is YAML
  if (activeFileIsYAML()) {
    activateEnvFromYAML(filenameForwardSlash);

    //Remove loading icon from bar
    activateEnvIcon.displayDefault();
  } else {
    // split string by . and return last array element to get extension
    const fileExt = activeFilename.split(".").pop();
    vscode.window.showErrorMessage(
      `Cannot read conda env info from a ${fileExt} file. Only YAML files are supported.`
    );
  }
}

/**
 * Deletes a Conda environment.
 * @function deleteCondaEnv
 * @description This function deletes a Conda environment. It checks if the active file is a YAML file and deletes the environment from the YAML file. If the active file is not a YAML file, it displays an error message indicating that only YAML files are supported.
 */
function deleteCondaEnv() {
  const filenameForwardSlash = getOpenDocumentPath();

  const activeFilename = vscode.window.activeTextEditor.document.fileName;

  // Validate open file is YAML
  if (activeFileIsYAML()) {
    deleteEnvFromYAML(filenameForwardSlash);

    //Remove loading icon from bar
    deleteEnvIcon.displayDefault();
  } else {
    // split string by . and return last array element to get extension
    const fileExt = activeFilename.split(".").pop();
    vscode.window.showErrorMessage(
      `Cannot read conda env info from a ${fileExt} file. Only YAML files are supported.`
    );
  }
}

// Command: "Conda Wingman: Create a YAML file from the active Conda Environment"
// This command will create a requirements yaml to with a name input from the user.
// TODO: Ask user for input and save as input.yaml.
async function writeRequirementsFile() {
  // Use current filename as default value if possible.
  const filepath = vscode.window.activeTextEditor.document.fileName;
  let filename = path.parse(filepath).base;

  if (filepath == "undefined" || !activeFileIsYAML()) {
    filename = "requirements.yml";
  }

  // Get response from user as to what to call their env.
  await createYAMLInputBox(filename);

  writeEnvIcon.displayDefault();
}

/**
 * Shows a quick pick of all conda environments and activates the selected one.
 * Runs `conda env list --json` to get the list of environments.
 * Also sets the workspace Python interpreter if autoSetInterpreter is enabled.
 */
async function switchEnvironment() {
  let envs;
  try {
    const output = execSync("conda env list --json", { encoding: "utf8", timeout: 10000 });
    const parsed = JSON.parse(output);
    envs = parsed.envs || [];
  } catch {
    vscode.window.showErrorMessage("Failed to list conda environments. Is conda installed?");
    return;
  }

  if (envs.length === 0) {
    vscode.window.showInformationMessage("No conda environments found.");
    return;
  }

  // Build quick pick items from env paths
  // Each path looks like /home/user/miniconda3/envs/myenv or /home/user/miniconda3 (base)
  const items = envs.map(envPath => {
    const name = path.basename(envPath);
    // The base env is the conda root dir itself, detect it
    const isBase = !envPath.includes(path.join("envs", name));
    return {
      label: isBase ? "base" : name,
      description: envPath,
      envPath: envPath,
    };
  });

  const selected = await vscode.window.showQuickPick(items, {
    placeHolder: "Select a conda environment to activate",
  });

  if (!selected) return;

  sendCommandToTerminal(`conda activate ${selected.label}`);

  // Auto-set interpreter if enabled
  if (getConfig().autoSetInterpreter) {
    const interpreterPath = getCondaInterpreterPath(selected.label);
    if (interpreterPath) {
      setWorkspacePythonInterpreter(interpreterPath).catch(() => {});
    }
  }
}

module.exports = {
  buildCondaYAML,
  activateCondaYAML,
  writeRequirementsFile,
  deleteCondaEnv,
  switchEnvironment,
};
