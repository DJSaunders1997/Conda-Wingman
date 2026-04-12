# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A VS Code extension that wraps common `conda` commands, providing status bar buttons and Command Palette entries for managing Conda environments from YAML files. Written in vanilla JavaScript (no TypeScript, no bundler). Activates when a YAML file is opened.

Sister project to [UV Wingman](https://github.com/DJSaunders1997/UV-Wingman), which does the same for the `uv` package manager but with more features (inline hints, dependency graph, etc.).

## Commands

```bash
npm run lint      # ESLint only
npm test          # Lint + run tests (via @vscode/test-electron)
```

No build step — the extension runs directly from JS source files.

## Architecture

```
extension.js       (activate: check conda, register commands, wire status bar, config listener)
  ├── commands.js        (4 command handlers: build, activate, export, delete)
  ├── statusBarItems.js  (CustomStatusBarItem class, 4 items, showAll/hideAll)
  ├── config.js          (reads condaWingman.* settings)
  └── utils.js           (sendCommandToTerminal, YAML helpers, activeFileIsYAML)
```

## Key Patterns

- **All commands require a YAML file open** — `requireYAMLFile()` in `commands.js` guards every handler.
- **Environment names are parsed from YAML** using `js-yaml` in `getEnvNameFromYAML()`.
- **Status bar visibility** is managed through `showAllStatusBarItems()`/`hideAllStatusBarItems()` controlled by the `condaWingman.showStatusBarItems` setting.
- **Terminal commands** are sent via `sendCommandToTerminal()` which creates a terminal if none exists.
