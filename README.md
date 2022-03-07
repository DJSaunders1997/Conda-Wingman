# Conda Wingman README

![Screenshot](images/Logo-Banner.png)

This is the README for the WIP extension "Conda Wingman".

This extension aims to help VSCode users manage and interact with Conda environments.
Conda Wingman aims to add QoL improvements that help programmers use environments without having to memorise all of the conda commands.

## Features
Currently Conda Wingman features are limited, but with big plans : )

### Creating Environments 
Currently the only feature of the extension is to easily allow users to create environments from a conda requirements.yaml file.

e.g.
```
name: example_conda_env
channels:
  - defaults
dependencies:
  - ca-certificates=2022.2.1=haa95532_0
  - certifi=2021.10.8=py39haa95532_2
  - openssl=1.1.1m=h2bbff1b_0
  - pip=21.2.4=py39haa95532_0
  - python=3.9.7=h6244533_1
  - setuptools=58.0.4=py39haa95532_0
  - sqlite=3.37.2=h2bbff1b_0
  - tzdata=2021e=hda174b7_0
  - vc=14.2=h21ff451_1
  - vs2015_runtime=14.27.29016=h5e58377_2
  - wheel=0.37.1=pyhd3eb1b0_0
  - wincertstore=0.2=py39haa95532_2
  - pip:
    - numpy==1.22.2
    - pandas==1.4.1
    - python-dateutil==2.8.2
    - pytz==2021.3
    - six==1.16.0
```
When a YAML file is opened as the active file in the text editor the option to create an environment from said file will be shown to the user in the status bar:

![Screenshot](images/Status-Bar-Screenshot.png)

Selecting this will run the command 
```conda env create -f YOUR-REQUIREMENTS.YML```
in the most recently used integrated terminal, or will create a new integrated terminal if one does not exist.

## Release Notes

### 0.0.1

Initial release of extension to VSCode Extension Marketplace


## Author

David Saunders - 2022