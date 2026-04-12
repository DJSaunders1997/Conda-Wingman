// Handles Python interpreter detection and auto-setting for conda environments.

const vscode = require("vscode");
const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

/**
 * Gets the base path for conda environments by running `conda info --json`.
 * Returns the first envs directory, or null if conda is unavailable.
 */
function getCondaEnvsDir() {
  try {
    const output = execSync("conda info --json", { encoding: "utf8", timeout: 10000 });
    const info = JSON.parse(output);
    // conda info returns an array of envs directories
    if (info.envs_dirs && info.envs_dirs.length > 0) {
      return info.envs_dirs[0];
    }
  } catch {
    // conda not available or failed
  }
  return null;
}

/**
 * Finds the Python interpreter path for a given conda environment name.
 * Checks the standard conda envs directory structure.
 * @param {string} envName - Name of the conda environment
 * @returns {string|null} Path to the Python binary, or null if not found
 */
function getCondaInterpreterPath(envName) {
  if (!envName) return null;

  const envsDir = getCondaEnvsDir();
  if (!envsDir) return null;

  const envPath = path.join(envsDir, envName);

  // Check platform-specific Python binary locations
  let candidates;
  if (process.platform === "win32") {
    candidates = [
      path.join(envPath, "python.exe"),
      path.join(envPath, "Scripts", "python.exe"),
    ];
  } else {
    candidates = [
      path.join(envPath, "bin", "python"),
      path.join(envPath, "bin", "python3"),
    ];
  }

  for (const p of candidates) {
    if (fs.existsSync(p)) {
      return p;
    }
  }

  return null;
}

/**
 * Update workspace Python interpreter settings to point to the given interpreter path.
 * Uses the modern "python.defaultInterpreterPath" setting.
 */
async function setWorkspacePythonInterpreter(interpreterPath) {
  if (!interpreterPath) return false;
  try {
    const pythonConfig = vscode.workspace.getConfiguration("python");
    await pythonConfig.update("defaultInterpreterPath", interpreterPath, vscode.ConfigurationTarget.Workspace);
    console.log(`Successfully set workspace Python interpreter to: ${interpreterPath}`);
    return true;
  } catch (err) {
    console.error("Failed to set workspace interpreter:", err);
    return false;
  }
}

/**
 * Gets the Python version string from a conda environment's Python binary.
 * @param {string} envName - Name of the conda environment
 * @returns {string|null} Version string like "3.12.1", or null
 */
function getCondaPythonVersion(envName) {
  const interpreterPath = getCondaInterpreterPath(envName);
  if (!interpreterPath) return null;

  try {
    const output = execSync(`"${interpreterPath}" --version`, { encoding: "utf8", timeout: 5000 }).trim();
    // Output is like "Python 3.12.1"
    return output.replace("Python ", "");
  } catch {
    return null;
  }
}

module.exports = {
  getCondaEnvsDir,
  getCondaInterpreterPath,
  setWorkspacePythonInterpreter,
  getCondaPythonVersion,
};
