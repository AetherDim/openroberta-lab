function extendArray(array0, array1) {
    for (var i = 0, len = array1.length; i < len; i++) {
        array0.push(array1[i]);
    }
}

function convertArray(array, defaultPath) {
    var result = []
    array.forEach(function(element) {
        if (typeof element == "string") {
            result.push(defaultPath + element)
        } else {
            // element is a dictionary
            extendArray(result, convertDictionary(element, defaultPath))
        }
    })
    return result
}

function convertDictionary(dict, defaultPath) {
    var result = []
    for (var key in dict) {
        var subFiles = dict[key]
        if (typeof subFiles == "string") {
            result.push(defaultPath + key + "/" + subFiles)
        } else {
            // subFiles is an array
            extendArray(result, convertArray(dict[key], defaultPath + key + "/"))
        }
    }
    return result
}

function addPaths(defaultPaths, simulationDirectoryStructure) {
    var simulationFilePaths = convertArray(simulationDirectoryStructure, "")
    simulationFilePaths.forEach(function(path) {
        defaultPaths[path] = 'app/simulation/simulationLogic/'+path;
    })
    return defaultPaths;
}

require.config({
    baseUrl: 'js',
    paths: addPaths({
        'codeflask': 'libs/codeflask/codeflask.min',
        'blockly': '../blockly/blockly_compressed',
        'bootstrap': 'libs/bootstrap/bootstrap-3.3.1-dist/dist/js/bootstrap.min',
        'bootstrap-table': 'libs/bootstrap/bootstrap-3.3.1-dist/dist/js/bootstrap-table.min',
        'bootstrap-tagsinput': 'libs/bootstrap/bootstrap-3.3.1-dist/dist/js/bootstrap-tagsinput.min',
        'bootstrap.wysiwyg': 'libs/bootstrap/bootstrap-3.3.1-dist/dist/js/bootstrap-wysiwyg.min',
        'enjoyHint': 'libs/enjoyHint/enjoyhint.min',
        'jquery': 'libs/jquery/jquery-3.3.1.min',
        'jquery-scrollto': 'libs/jquery/jquery.scrollTo-2.1.2.min',
        'jquery-validate': 'libs/jquery/jquery.validate-1.17.0.min',
        'jquery-hotkeys': 'libs/jquery/jquery.hotkeys-0.2.0',
        'slick': 'libs/slick/slick.min',
        'socket.io': 'libs/socket.io/socket.io',
        'volume-meter': 'libs/sound/volume-meter',
        'neuralnetwork-lib': 'libs/neuralnetwork/lib',
        'd3': 'libs/neuralnetwork/d3.min',
        'pixijs': 'libs/pixi.js/pixi.min', // workaround with fake module for pixi.js due to reqirejs not supporting .js within the name
        'matter-js': 'libs/matterjs/matter.min',
        'webfontloader': 'libs/webfontloader/webfontloader',

        'confDelete.controller': 'app/roberta/controller/confDelete.controller',
        'configuration.controller': 'app/roberta/controller/configuration.controller',
        'configuration.model': 'app/roberta/models/configuration.model',
        'confList.controller': 'app/roberta/controller/confList.controller',
        'confList.model': 'app/roberta/models/confList.model',
        'galleryList.controller': 'app/roberta/controller/galleryList.controller',
        'tutorialList.controller': 'app/roberta/controller/tutorialList.controller',
        'guiState.controller': 'app/roberta/controller/guiState.controller',
        'guiState.model': 'app/roberta/models/guiState.model',
        'import.controller': 'app/roberta/controller/import.controller',
        'language.controller': 'app/roberta/controller/language.controller',
        'legal.controller': 'app/roberta/controller/legal.controller',
        'logList.controller': 'app/roberta/controller/logList.controller',
        'logList.model': 'app/roberta/models/logList.model',
        'menu.controller': 'app/roberta/controller/menu.controller',
        'multSim.controller': 'app/roberta/controller/multSim.controller',
        'notification.controller': 'app/roberta/controller/notification.controller',
        'notification.model': 'app/roberta/models/notification.model',
        'nn.controller': 'app/roberta/controller/nn.controller',
        'progCode.controller': 'app/roberta/controller/progCode.controller',
        'progDelete.controller': 'app/roberta/controller/progDelete.controller',
        'progHelp.controller': 'app/roberta/controller/progHelp.controller',
        'progInfo.controller': 'app/roberta/controller/progInfo.controller',
        'progSim.controller': 'app/roberta/controller/progSim.controller',
        'progRun.controller': 'app/roberta/controller/progRun.controller',
        'progList.controller': 'app/roberta/controller/progList.controller',
        'progList.model': 'app/roberta/models/progList.model',
        'program.controller': 'app/roberta/controller/program.controller',
        'program.model': 'app/roberta/models/program.model',
        'progTutorial.controller': 'app/roberta/controller/progTutorial.controller',
        'progShare.controller': 'app/roberta/controller/progShare.controller',
        'progSim.controller': 'app/roberta/controller/progSim.controller',
        'robot.controller': 'app/roberta/controller/robot.controller',
        'robot.model': 'app/roberta/models/robot.model',
        'tour.controller': 'app/roberta/controller/tour.controller',
        'user.controller': 'app/roberta/controller/user.controller',
        'userGroup.controller': 'app/roberta/controller/userGroup.controller',
        'userGroup.model': 'app/roberta/models/userGroup.model',
        'user.model': 'app/roberta/models/user.model',
        'rest.robot': 'app/roberta/rest/robot',
        'socket.controller': 'app/roberta/controller/socket.controller',
        'webview.controller': 'app/roberta/controller/webview.controller',
        'sourceCodeEditor.controller': 'app/roberta/controller/sourceCodeEditor.controller',

        'comm': 'helper/comm',
        'log': 'helper/log',
        'message': 'helper/msg',
        'util': 'helper/util',
        'wrap': 'helper/wrap',

        'interpreter.constants': 'app/nepostackmachine/interpreter.constants',
        'interpreter.interpreter': 'app/nepostackmachine/interpreter.interpreter',
        'interpreter.aRobotBehaviour': 'app/nepostackmachine/interpreter.aRobotBehaviour',
        'interpreter.robotWeDoBehaviour': 'app/nepostackmachine/interpreter.robotWeDoBehaviour',
        'interpreter.robotSimBehaviour': 'app/nepostackmachine/interpreter.robotSimBehaviour',
        'interpreter.state': 'app/nepostackmachine/interpreter.state',
        'interpreter.util': 'app/nepostackmachine/interpreter.util',
        'interpreter.jsHelper': 'app/nepostackmachine/interpreter.jsHelper',

        'neuralnetwork.nn': 'app/neuralnetwork/neuralnetwork.nn',
        'neuralnetwork.state': 'app/neuralnetwork/neuralnetwork.state',
        'neuralnetwork.playground': 'app/neuralnetwork/neuralnetwork.playground',

        'confVisualization': 'app/configVisualization/confVisualization',
        'const.robots': 'app/configVisualization/const.robots',
        'port': 'app/configVisualization/port',
        'robotBlock': 'app/configVisualization/robotBlock',
        'wires': 'app/configVisualization/wires',


        'simulation.constants': 'app/simulation/simulationLogic/simulation.constants',
        'simulation.simulation': 'app/simulation/simulationLogic/simulation',

        'main': 'main',
        'mainSim': 'mainSim',


    },[
        'SceneRenderer',
        'Timer',
        'ExtendedMatter',
        'Displayable',
        'Color',
        'Unit',
        'ScrollView',
        'ProgramManager',
        'SharedAssetLoader',
        'Random',
        'Util',
        'Entity',
        { 'Scene': [
                'Scene',
                'TestScene',
                'TestScene2',
                'AsyncChain',
            ]},
        { 'Geometry': [
                'Line',
                'LineBaseClass',
                'LineSegment',
                'Ray',
                'Polygon',
            ]},
        { 'Robot': [
                'Robot',
                'ElectricMotor',
                'RobotSimBehaviour',
                'Wheel',
                'RobotHardwareStateSensors',
                'ColorSensor',
                'RobotUpdateOptions',
                'UltrasonicSensor',
                'TouchSensor'
            ]},
        { 'RRC': [
                'RRAssetLoader',
                'AgeGroup',
                { 'Scene': [
                        'RRCScene',
                        'RRCLineFollowingScene',
                        'RRCRainbowScene',
                        'RRCLabyrinthScene',
                    ]}
            ]},
        { "Waypoints": [
                "Waypoint",
                "WaypointList",
                "WaypointsManager",
                "ScoreWaypoint",
            ]}
    ]),
    shim: {
        'bootstrap': {
            deps: ['jquery']
        },
        'blockly': {
            exports: 'Blockly'
        },
        'confVisualization': {
            deps: ['blockly']
        },
        'robotBlock': {
            deps: ['blockly']
        },
        'port': {
            deps: ['blockly']
        },
        'volume-meter': {
            exports: "Volume",
            init: function() {
                return {
                    createAudioMeter: createAudioMeter
                };
            }
        },
        'jquery-validate': {
            deps: ['jquery']
        }
    }
});

console.log("Init imports ...")