# Extended README


## Best practices

- Use `npm ci` instead of `npm install`
- Do not call `npm update` unless you want to update all packages (and know what you are doing). This changes the `package-lock.json` file.
- Update TypeScript to the latest version using `npm install -g typescript@latest` (**g**lobally installs the latest TypeScript version)



## Setup

- Clone Repository
- Open IntelliJ (but not the cloned project)
    - File -> New -> Open from existing sources
    - Choose `Maven`
    - If there is some IntelliJ which says `load maven configuration`, then click on it
    - Go to `'Maven tab'`
      - Press `Reload All Maven Projects`
      - Got to `OpenRobertaParent (root) -> Lifecycle` and click `clean` and then `install`
    - Go to `Module Settings`
      - Go to `Project` and set the `ProjectSDK` to `Java 1.8`
      - Go to `Modules -> OpenRobertaServer -> Dependencies` and set the `scope` of all directories from `Test` to `Compile` (the directories have not 'Maven' in their name and a folder symbol)
    - Open terminal and execute `./ora.sh create-empty-db` in `openroberta-lab`
    - Go to `OpenRobertaServer/src/main/java/de/fhg/iais/roberta/main/ServerStarter.java` and press the play button next to the declaration
    - In the `Run/Debug Configurations` (or `Run -> Edit Configurations…`) set...
        - ... JDK or JRE to `java 8 1.8`
        - ... Module to `OpenRobertaServer`
        - ... CLI arguments to `-d server.staticresources.dir=./OpenRobertaServer/staticResources -d robot.crosscompiler.resourcebase=../ora-cc-rsc`
    - (Check again in `Module Settings` that all settings are still correct. If not, then set them again and proceed)
    - Then start the server by pressing the play button
- Open VSCode
    - `File -> Open… -> 'openroberta-lab/TypeScriptSources'`
    - `Terminal -> New Terminal`
- **Setup TypeScript and other packages** using the terminal
    - `npm ci` installs all necessary packages
- Manual installation (normally not required)
    - `npm install -g typescript` **g**lobally installs TypeScript
    - `npm install matter-js` installs matter.js which is the physics engine
    - `npm install tslib` installs tslib which is the helper library
    - `npm install --save dat.gui` installs dat.gui
    - `npm install --save @types/dat-gui` installs typescript types for dat.gui


## Working with the project

When changing something in `openroberta-lab/TypeScriptSources/ts` in VSCode:
- In the terminal. Type and press enter: `tsc` which compiles the TypeScript source files to `openroberta-lab/OpenRobertaServer/staticResources/js/...`
- If files were added/removed
    - Open `openroberta-lab/OpenRobertaServer/staticResources/js/imports.js`
    - The second argument of `addPaths({...}, [...])` has to reflect the directory structure of `openroberta-lab/OpenRobertaServer/staticResources/js/app/simulation/simulationLogic/`
- When running `tsc` and the error occurs e.g. `Cannot find module ...` you might have to execute `npm install` first

When you want to add a new library using npm:
- Install the library using npm
- Copy the minified build of the library to `OpenRobertaServer/staticResources/js/libs/[library name]/[minified library js file]`
- Add the library to `imports.js` in the first argument of `addPaths({...}, [...])`


## Error messages and possible fixes

When compiling TypeScript using `tsc`
- `Cannot find module ...`: Checkout the latest commit and run `npm ci`

When compiling the server
- A java package cannot be found:
    - Go to the `'Maven tab'` press `Reload All Maven Projects`
    - Go to `Module Settings -> Modules -> OpenRobertaServer -> Dependencies` and set the `scope` of all directories from `Test` to `Compile` (the directories have not 'Maven' in their name and a folder symbol)
    - Recompile the project
