import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import config from "./config.js";

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

let argv = yargs(hideBin(process.argv))
    // .command("rst", "track a thing")
    .option("init", {
        type: "boolean",
        default: false,
        description: "initialize rst with a config",
    })
    .option("force", {
        type: "boolean",
        default: false,
        description: `"force" a command (if possible)`,
    })
    .option("set-default-thing", {
        type: "string",
        requiresArg: true,
        description: "set the default thing",
    })
    .option("show-defaults", {
        type: "boolean",
        default: false,
        description: "set the default thing",
    })
    .option("timestamp", {
        type: "number",
        default: Date.now(),
        description: "set the default thing",
    })
    .option("thing", {
        type: "string",
        default: config.defaults.thing,
        description:
            "use named thing, when called with no option it lists available things",
    });

if (config && config.things[config.defaults.thing]) {
    let thingConfig = config.things[config.defaults.thing].options;

    for (const thingOption in thingConfig) {
        argv.option(thingConfig[thingOption].name, {
            type: translateDataType(thingConfig[thingOption].dataType),
            alias: thingConfig[thingOption].shortName,
            description: `${config.defaults.thing}: ${thingConfig[thingOption].description}`,
        });
    }
}

argv.option("wat", {
    type: "string",
    description: "wat",
});

export default argv.parse(hideBin(process.argv));
