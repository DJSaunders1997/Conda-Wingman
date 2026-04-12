# Change Log

All notable changes to the "Conda Wingman" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [1.1.0] - 2026-04

### Added
- `conda` availability check on activation — warns if `conda` is not on PATH with install link
- `condaWingman.showStatusBarItems` setting to toggle status bar buttons
- Config listener — status bar reacts to setting changes without reload
- Null-safe editor checks — no more crashes when no file is open
- `requireYAMLFile()` shared validation — eliminates duplicated YAML checks across commands
- `showAllStatusBarItems()` / `hideAllStatusBarItems()` helpers
- Recommendation for [UV Wingman](https://marketplace.visualstudio.com/items?itemName=DJSaunders1997.uv-wingman) in README for new projects

### Changed
- Modernised all code from `var` to `const`/`let`
- Simplified `sendCommandToTerminal` with undefined guard
- Shortened status bar labels (e.g. "Build Env from YAML" → "Build Env")
- Cleaned up verbose `console.log` calls and stale TODO comments
- Fixed named-argument antipattern in `CustomStatusBarItem` constructors (was creating global variables)
- Renamed "Write Requirements File" to "Export Environment to YAML"
- Updated GitHub Actions workflow to Node 20 and modern action versions
- Switched README badges from `vsmarketplacebadges.dev` to `shields.io`

### Removed
- Noisy `showInformationMessage` popups for routine actions

## [1.0.0] - 2024-02
- First official release out of preview!
- Adding `Delete Env` functionality.
- Added automated release process using GitHub Actions.

## [0.2.1] - 2023-03
- Fixed bug that kept wingman status bar items open even when yaml was closed.

## [0.2.0] - 2022-03
- New feature that allows users to activate environments straight from the requirements files by parsing the file.
- New buttons for Activating Envs and Writing requirement files.
- Icon Overhaul for Build Env status bar button.
- Interface added when user writes a requirement file.

## [0.1.0] - 2022-03
- Changing to [semantic versioning numbers](https://semver.org/).
- Added functionality to create conda environment YAML files from the command pallet. Small update to logo.

## [0.0.2] - 2022-03
- Improving readme.

## [0.0.1] - 2023-03
- Initial release of extension to VSCode Extension Marketplace
