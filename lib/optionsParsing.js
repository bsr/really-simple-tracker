import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import config from "./config.js";
import { init, configFile, appDir } from "./utils.js";
import { track, setDefaultThing, argvToThingOptions } from "./thing.js";

let appArgs = yargs(hideBin(process.argv))
    .command(
        ["track <message>", "$0 <message>"],
        "Track a thing",
        (yargs, helpOrVersionSet) => {
            // console.log("yargs", yargs);
            // console.log("helpOrVersionSet", helpOrVersionSet);

            yargs
                .option("thing", {
                    type: "string",
                    description: "which thing to track",
                })
                .option("timestamp", {
                    type: "string",
                    default: Date.now(),
                    description: "set the time the thing happened",
                });

            if (config && config.things[config.defaults.thing]) {
                let thingConfig = config.things[config.defaults.thing].options;

                for (const thingOption in thingConfig) {
                    yargs.option(thingConfig[thingOption].name, {
                        type: translateDataType(
                            thingConfig[thingOption].dataType,
                        ),
                        alias: thingConfig[thingOption].shortName,
                        description: `${config.defaults.thing}: ${thingConfig[thingOption].description}`,
                    });
                }
            }
            return yargs;
        },
        async (argv) => {
            try {
                console.log("XXXargv:", argv);
                console.log(
                    "argvToThingOptions(argv.thing, argv)",
                    argvToThingOptions(argv.thing, argv),
                );
                await track(
                    argv.thing.toString(),
                    argvToThingOptions(argv.thing, argv),
                );
                console.log(`${argv.thing.toString()} saved`);
            } catch (err) {
                console.error(err.message);
                process.exit(1);
            }
        },
    )
    .command(["show"], "Show a thing", (yargs, helpOrVersionSet) => {
        // console.log("yargs", yargs);
        // console.log("helpOrVersionSet", helpOrVersionSet);

        yargs
            .option("startDate", {
                type: "string",
                alias: "s",
                description: "optional date/time range start",
            })
            .option("endDate", {
                type: "string",
                alias: "e",
                description: "optional date/time range end",
            })
            .option("format", {
                alias: "f",
                default: "calendar",
                description: "what format to output",
                choices: ["calendar", "json"],
            });

        return yargs;
    })
    .command(
        "set <thing>",
        "Set the default thing",
        (yargs, helpOrVersionSet) => {
            return yargs;
        },
        async (argv) => {
            try {
                await setDefaultThing(argv["thing"]);
                console.log(`default thing is now "${argv["thing"]}"`);
            } catch (err) {
                console.error(err.message);
                process.exit(1);
            }
        },
    )
    .command(
        "list",
        "List the things to track",
        (yargs, helpOrVersionSet) => {
            return yargs;
        },
        async (argv) => {
            let things = Object.keys(config.things);
            things.forEach((t) => {
                console.log(`${t}: ${config.things[t].description}`);
                console.log("  options:");
                let options = Object.keys(config.things[t].options);
                options.forEach((o) => {
                    console.log(
                        `    ${config.things[t].options[o].name}: ${config.things[t].options[o].description}`,
                    );
                });
            });
        },
    )
    .command(
        "init",
        "Initialize tracker",
        (yargs, helpOrVersionSet) => {},
        async (argv) => {
            const success = await init(argv.force);
            if (success) {
                console.log(`${configFile} created`);
            } else {
                process.exit(1);
            }
            process.exit(0);
        },
    )
    .option("thing", {
        type: "string",
        description: "what thing to track",
        default: config.defaults.thing,
    })
    .help().argv;

// console.log("argv:", await appArgs.argv);

function translateDataType(dataType) {
    let retval = "string";
    switch (dataType) {
        case "time":
        case "string":
        case "dateTime":
            retval = "string";
            break;
        case "number":
            retval = "number";
            break;
        case "count":
            retval = "count";
            break;
        case "boolean":
            retval = "boolean";
            break;
    }
    return retval;
}

export { appArgs };
