// Provides clickable links for package names in conda environment YAML files.
// Conda packages link to anaconda.org, pip sub-dependencies link to PyPI.

const vscode = require("vscode");
const yaml = require("js-yaml");

const ANACONDA_BASE = "https://anaconda.org/conda-forge/";
const PYPI_BASE = "https://pypi.org/project/";

/**
 * Parses a conda environment YAML and returns dependency positions.
 * Returns [{ lineNum, colStart, colEnd, name, isPip }]
 */
function findCondaDepPositions(text) {
  let doc;
  try {
    doc = yaml.load(text);
  } catch {
    return [];
  }

  if (!doc || !Array.isArray(doc.dependencies)) return [];

  // Collect all known dependency names so we can find them in the text
  const condaNames = new Set();
  const pipNames = new Set();

  for (const dep of doc.dependencies) {
    if (typeof dep === "string") {
      // Conda dep like "numpy=1.24.0" or "python>=3.10"
      const name = dep.split(/[=<>!~\s]/)[0].trim();
      if (name) condaNames.add(name);
    } else if (typeof dep === "object" && Array.isArray(dep.pip)) {
      // Pip sub-dependencies
      for (const pipDep of dep.pip) {
        if (typeof pipDep === "string") {
          const name = pipDep.split(/[=<>!~\s\[]/)[0].trim();
          if (name) pipNames.add(name);
        }
      }
    }
  }

  // Scan lines to find positions of known package names
  const results = [];
  const lines = text.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Match lines like "  - packagename" or "  - packagename=1.2.3" or "  - packagename>=1.0"
    const depMatch = line.match(/^(\s*-\s+)([a-zA-Z0-9][\w.-]*)/);
    if (!depMatch) continue;

    const name = depMatch[2];
    const colStart = depMatch[1].length;
    const colEnd = colStart + name.length;

    if (condaNames.has(name)) {
      results.push({ lineNum: i, colStart, colEnd, name, isPip: false });
    } else if (pipNames.has(name)) {
      results.push({ lineNum: i, colStart, colEnd, name, isPip: true });
    }
  }

  return results;
}

/**
 * DocumentLinkProvider for conda environment YAML files.
 * Links conda packages to anaconda.org and pip packages to PyPI.
 */
class CondaYAMLLinkProvider {
  provideDocumentLinks(document) {
    const text = document.getText();
    const positions = findCondaDepPositions(text);

    return positions.map(pos => {
      const range = new vscode.Range(
        new vscode.Position(pos.lineNum, pos.colStart),
        new vscode.Position(pos.lineNum, pos.colEnd)
      );
      // Conda packages go to anaconda.org, pip packages go to PyPI
      const base = pos.isPip ? PYPI_BASE : ANACONDA_BASE;
      const uri = vscode.Uri.parse(base + pos.name);
      return new vscode.DocumentLink(range, uri);
    });
  }
}

/**
 * Registers the document link provider for conda YAML files.
 * @param {vscode.ExtensionContext} context
 */
function registerDocumentLinks(context) {
  // Register for all YAML files — findCondaDepPositions returns empty
  // for non-conda YAML files (no dependencies key) so this is safe.
  context.subscriptions.push(
    vscode.languages.registerDocumentLinkProvider({ language: "yaml" }, new CondaYAMLLinkProvider())
  );
}

module.exports = { registerDocumentLinks, findCondaDepPositions };
