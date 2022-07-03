import config from "./config.js";
import { configFile } from "./utils.js";

async function setDefaultThing(thing) {
    if (!config.things[thing]) {
        throw new Error(`thing "${thing}" not found, can't set as default`);
    }
    config.defaults.thing = thing;
    await writeFile(configFile, JSON.stringify(config, null, 2));
}

function argvToThingOptions(thing, argv) {
    if (!config.things[thing]) {
        throw new Error(`thing "${thing}" not found, can't track`);
    }
    let retval = {};
    let options = Object.keys(config.things[thing].options);

    for (const o of options) {
        if (argv[o]) {
            retval[o] = argv[o];
        }
    }

    retval["_"] = argv["_"].join(" ");

    return retval;
}

async function track(thing, options) {
    console.log("options:", options);
}

export { track, argvToThingOptions, setDefaultThing };
