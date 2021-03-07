#Extended README

##Setup

- Clone Repository
- Open IntelliJ
    - File -> New -> Open from existing sources
    - Choose Maven
    - Go to `Module Settings` and set all directories in `Module -> OpenRobertaServer` from `Test` to `Compile`
    - Go to Maven tab -> `OpenRobertaParent (root)` -> Lifecycle -> `clean` and then `install`
    - Open terminal and execute `./ora.sh create-empty-db` in `openroberta-lab`
    - Go to `OpenRobertaServer/src/main/java/de/fhg/iais/roberta/main/ServerStarter.java` and press the play button next to the declaration
    - In the `Run/Debug Configurations` (or `Run -> Edit Configurations…`) set
        - JDK or JRE to `java 8 1.8`
        - Module to `OpenRobertaServer`
        - CLI arguments to `-d server.staticresources.dir=./OpenRobertaServer/staticResources -d robot.crosscompiler.resourcebase=../ora-cc-rsc`
    - Then start the server by pressing the play button
- Open VSCode
    - File -> Open… -> `openroberta-lab/TypeScriptSources`
    - Terminal -> New Terminal
    - In the terminal. Type and press enter:
        - `npm install -g typescript` which globally installs TypeScript
        - `npm install matter-js` which installs matter.js which is the physics engine
        - `npm install tslib` which installs tslib which is the helper library
        - `npm install --save dat.gui` which installs dat.gui
        - `npm install --save @types/dat-gui` which installs typescript types for dat.gui
        - `npm i`


##Working with the project

When changing something in `openroberta-lab/TypeScriptSources/ts` in VSCode:
- In the terminal. Type and press enter: `tsc` which compiles the TypeScript source files to `openroberta-lab/OpenRobertaServer/staticResources/js/…`
- If files were added/removed
    - Open `openroberta-lab/OpenRobertaServer/staticResources/js/main.js`
    - The second argument of `addPaths({ … }, […])` has to reflect the directory structure of `openroberta-lab/OpenRobertaServer/staticResources/js/app/simulation/simulationLogic/`
- When running `tsc` and the error occurs e.g. `Cannot find module …` you might have to execute `nom install` first

When you want to add a new library using npm:
- Install the library using npm
- Copy the minified build of the library to `OpenRobertaServer/staticResources/js/libs/[library name]/[minified library js file]`
- Add the library to `main.js`