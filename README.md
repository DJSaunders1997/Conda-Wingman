# Conda Wingman

![Banner](images/Logo-Banner.png)

This is the README for the WIP extension [Conda Wingman](https://marketplace.visualstudio.com/items?itemName=DJSaunders1997.conda-wingman).

[![Version](https://vsmarketplacebadges.dev/version-short/djsaunders1997.conda-wingman.svg?style=for-the-badge&colorA=252525&colorB=#42AF29)](https://marketplace.visualstudio.com/items?itemName=djsaunders1997.conda-wingman)
[![Downloads](https://vsmarketplacebadges.dev/downloads-short/djsaunders1997.conda-wingman.svg?style=for-the-badge&colorA=252525&colorB=#42AF29)](https://marketplace.visualstudio.com/items?itemName=djsaunders1997.conda-wingman)
[![Ratings](https://vsmarketplacebadges.dev/rating-short/djsaunders1997.conda-wingman.svg?style=for-the-badge&colorA=252525&colorB=#42AF29)](https://marketplace.visualstudio.com/items?itemName=djsaunders1997.conda-wingman)

This extension aims to help VSCode users manage and interact with Conda environments.
Conda Wingman aims to add QoL improvements that help programmers use environments without having to memorise all of the conda commands.

## Features
Currently Conda Wingman features are limited, but with big plans : )

The extension supports the following features at the click of a button / single command:

### Creating Environments 
Create a Conda environment from the open requirements file.
Selecting this will run the command 
```conda env create -f YOUR-REQUIREMENTS.YML```
in the most recently used integrated terminal. If no terminals currently exist the extension will create a new one.

VScode command pallet: ```>Conda Wingman: Build Conda Environment from YAML file```


### Activating Environments
If you've already build the environment, you can instead activate it with another command.
Selecting this will run the command 
```conda activate YOUR-ENVIRONMENT```

VScode command pallet: ```>Conda Wingman: Activate Conda Environment from YAML file```

### Writing Requirements Files

This will output the contents of your active Conda environment to a file of your choice.
Selecting this will run the command 
```conda env export > YOUR_REQUIREMENTS_FILE```
VScode command pallet: ```>Conda Wingman: Write a requirements YAML file from the active Conda Environment```

## Use
When a YAML file is opened as the active file in the text editor the feature options will be visible in the status bar:

![Status Bar](images/Status-Bar-Screenshot.png)

But of course they can also be accessed from the VScode command pallet:
![Command Pallet](images/Pallet-Create-Screenshot.png)

## Release Notes

### 0.2.1
- Fixed bug that kept wingman status bar items open even when yaml was closed. 

### 0.2.0
- New feature that allows users to activate environments straight from the requirements files by parsing the file.
- New buttons for Activating Envs and Writing requirement files.
- Icon Overhaul for Build Env status bar button.
- Interface added when user writes a requirement file.


### 0.1.0

- Changing to [semantic versioning numbers](https://semver.org/).
Added functionality to create conda environment YAML files from the command pallet. Small update to logo.

### 0.0.2

- Improving readme.
### 0.0.1

- Initial release of extension to VSCode Extension Marketplace


## Author

David Saunders - 2022