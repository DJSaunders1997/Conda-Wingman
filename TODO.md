# TODO 

## TODO Features:
- Create conda environment from running command when conda environment is open
    - Functionality should be easy to implement with current codebase.
- Create conda environment from running command when conda environment is NOT open. 
    - (Scan all .yml files in working directory and then build any that look like valid yml)
    - (If there are more than 1 yml file display a dropdown to the user so they can choose which yml to build off of)
- Auto-read filename each time a new file is opened. Then add button/tooltip/inline message asking users if they want to build this conda file.
- Detect when new packages are added to the conda env and ask user if they want to add to the yaml.
- If users try to build an environment that already exists then show prompt asking if they would like to overwrite existing environment.
- Easy deletion of environments.

## TODO Fixes
- Commands should be OS agnostic.
    - Failing this users should at least be able to enter their OS in a config file somewhere.
    - Can we get the running OS in JavaScript and then have a conditional to run command for only that OS each time we want to run a command?
