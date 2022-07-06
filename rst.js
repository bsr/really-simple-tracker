#!env node
import config from "./lib/config.js";
import { appArgs } from "./lib/optionsParsing.js";
import { init, configFile, appDir } from "./lib/utils.js";
import { track, setDefaultThing, argvToThingOptions } from "./lib/thing.js";

// console.log("argv:", argv);
// if (argv.verbose) {
//     console.log("argv:", argv);
// }

// if (argv.init) {
// }

// if (argv["show-defaults"]) {
//     console.log("Default thing:", config.defaults.thing);
//     process.exit(0);
// }

// if (argv["_"].length == 0) {
//     appArgs.showHelp();
//     process.exit(1);
// }

// track the thing
