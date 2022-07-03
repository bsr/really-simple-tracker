#!env node
import config from "./lib/config.js";
import argv from "./lib/optionsParsing.js";
import { init, configFile, appDir } from "./lib/utils.js";
import { track, setDefaultThing, argvToThingOptions } from "./lib/thing.js";

console.log("argv:", argv);
if (argv.verbose) {
    console.log("argv:", argv);
}

if (argv.init) {
    const success = await init(argv.force);
    if (success) {
        console.log(`${configFile} created`);
    } else {
        process.exit(1);
    }
    process.exit(0);
}

if (argv.thing === "") {
    let things = Object.keys(config.things);
    things.forEach((t) => {
        console.log(`${t}: ${config.things[t].description}`);
        let options = Object.keys(config.things[t].options);
        options.forEach((o) => {
            console.log(
                `  ${config.things[t].options[o].name}: ${config.things[t].options[o].description}`,
            );
        });
    });
}

if (argv["set-default-thing"]) {
    try {
        await setDefaultThing(argv["set-default-thing"]);
        console.log(`default thing is now "${argv["set-default-thing"]}"`);
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
}

if (argv["show-defaults"]) {
    console.log("Default thing:", config.defaults.thing);
    process.exit(0);
}

// track the thing
try {
    await track(argv.thing.toString(), argvToThingOptions(argv.thing, argv));
} catch (err) {
    console.error(err.message);
    process.exit(1);
}
