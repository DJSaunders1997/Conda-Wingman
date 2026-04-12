// Provides hover tooltips on package names in conda environment YAML files,
// showing package description and latest version from PyPI.

const vscode = require("vscode");
const https = require("https");
const { findCondaDepPositions } = require("./documentLinks");

/** Simple in-memory cache: pkgName -> { version, summary, fetchedAt } */
const cache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

/** Invisible decoration type used only to attach hover tooltips to package names */
const hoverDecorationType = vscode.window.createTextEditorDecorationType({});

/**
 * Fetches package info from the PyPI JSON API.
 * Returns { version, summary } or null on failure.
 */
function fetchPypiInfo(pkgName) {
  return new Promise(resolve => {
    const url = `https://pypi.org/pypi/${encodeURIComponent(pkgName)}/json`;
    const req = https.get(url, { timeout: 5000 }, res => {
      if (res.statusCode !== 200) {
        res.resume();
        resolve(null);
        return;
      }
      let data = "";
      res.on("data", chunk => { data += chunk; });
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          resolve({
            version: json.info.version,
            summary: json.info.summary || "",
          });
        } catch {
          resolve(null);
        }
      });
    });
    req.on("error", () => resolve(null));
    req.on("timeout", () => { req.destroy(); resolve(null); });
  });
}

/**
 * Returns cached PyPI info or fetches it, with TTL-based expiry.
 */
async function getPypiInfo(pkgName) {
  const cached = cache.get(pkgName);
  if (cached && (Date.now() - cached.fetchedAt) < CACHE_TTL_MS) {
    return cached;
  }
  const info = await fetchPypiInfo(pkgName);
  if (info) {
    cache.set(pkgName, { ...info, fetchedAt: Date.now() });
  }
  return info;
}

/** Track the current update so we can cancel stale runs */
let updateCounter = 0;

/**
 * Updates hover decorations for the given text editor.
 * Only applies to YAML files that look like conda environment files.
 */
async function updateDecorations(editor) {
  if (!editor) return;

  const filePath = editor.document.uri.path;
  if (!filePath.endsWith(".yml") && !filePath.endsWith(".yaml")) return;

  const thisUpdate = ++updateCounter;
  const text = editor.document.getText();
  const positions = findCondaDepPositions(text);

  if (positions.length === 0) {
    editor.setDecorations(hoverDecorationType, []);
    return;
  }

  const results = await Promise.all(
    positions.map(async (pos) => {
      const info = await getPypiInfo(pos.name);
      return { ...pos, info };
    })
  );

  // Check we haven't been superseded by a newer update
  if (thisUpdate !== updateCounter) return;
  if (editor !== vscode.window.activeTextEditor) return;

  const hoverDecorations = [];

  for (const { lineNum, colStart, colEnd, name, isPip, info } of results) {
    if (!info) continue;

    // Build hover tooltip content
    const parts = [];
    if (info.summary) parts.push(info.summary);
    parts.push(`**Latest version:** ${info.version}`);

    // Link to the right package index
    if (isPip) {
      parts.push(`[View on PyPI](https://pypi.org/project/${name}/)`);
    } else {
      parts.push(`[View on Anaconda](https://anaconda.org/conda-forge/${name})`);
      parts.push(`[View on PyPI](https://pypi.org/project/${name}/)`);
    }

    hoverDecorations.push({
      range: new vscode.Range(lineNum, colStart, lineNum, colEnd),
      hoverMessage: new vscode.MarkdownString(parts.join("\n\n")),
    });
  }

  editor.setDecorations(hoverDecorationType, hoverDecorations);
}

/** Debounce timer for document changes */
let debounceTimer;

/**
 * Registers hover tooltip decorations for conda YAML files.
 * @param {vscode.ExtensionContext} context
 */
function registerCodeLens(context) {
  // Decorate the active editor if it's a YAML file
  if (vscode.window.activeTextEditor) {
    updateDecorations(vscode.window.activeTextEditor);
  }

  // Re-decorate when switching editors
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(editor => {
      if (editor) {
        updateDecorations(editor);
      }
    })
  );

  // Re-decorate on document changes (debounced)
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument(e => {
      const editor = vscode.window.activeTextEditor;
      if (editor && e.document === editor.document) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => updateDecorations(editor), 1000);
      }
    })
  );
}

module.exports = { registerCodeLens };
