import config from "./config.js";
import { configFile, appDir, parseDate } from "./utils.js";

import { mkdir, writeFile, readFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, basename } from "node:path";

const maxRecordsPerFile = 1000;
const thingFileDigits = 6;

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

    retval.timestamp = argv.timestamp;

    retval["_message"] = `${argv.message} ${argv["_"].join(" ")}`;

    return retval;
}

function validateAndNormalizeTrack(thing, options) {
    let validation = {
        valid: false,
        reason: "",
        normalizedOptions: { ...options },
    };
    const timestamp = parseDate(options.timestamp);
    if (!timestamp) {
        validation.valid = false;
        validation.reason = `"${options.timestamp}" could not be parsed.`;
        return validation;
    }

    validation.valid = true;
    validation.normalizedOptions.timestamp = timestamp;

    return validation;
}

async function track(thing, options) {
    if (!existsSync(thingDir(thing))) {
        await initThingDir(thing);
    }

    const validation = validateAndNormalizeTrack(thing, options);
    if (!validation.valid) {
        throw new Error(`Invalid track: ${validation.reason}`);
    }

    let toSave = validation.normalizedOptions;
    let thingInfo = await getLastThingFileInfo(thing);

    toSave._id = getNextThingId(thingInfo.file, thingInfo.contents);
    thingInfo.contents.push(toSave);
    await saveThing(thingInfo.file, thingInfo.contents);
}

async function saveThing(file, contents) {
    let toSave = contents.map((c) => JSON.stringify(c)).join("\n");
    await writeFile(file, toSave);
}

function thingFilename(number) {
    return `${number.toString().padStart(thingFileDigits, "0")}.jsonl`;
}

async function initThingDir(thing) {
    return await mkdir(thingDir(thing), { recursive: true });
}

async function getThingFileList(thing) {
    return (await readdir(thingDir(thing)))
        .filter((f) => f.endsWith(".jsonl"))
        .sort()
        .map((f) => join(thingDir(thing), f));
}

async function getLastThingFileInfo(thing) {
    let file = false;
    let fileNumber = -1;
    let contentsRaw = [];

    let fileList = await getThingFileList(thing);
    if (fileList.length > 0) {
        file = fileList.pop();
    }

    // TODO: refactor to use getThingFile()
    if (file) {
        fileNumber = parseInt(file.split(".").shift(), 10);
        contentsRaw = (await readFile(file, { encoding: "utf8" }))
            .split("\n")
            .filter((e) => e != "");
    }

    if (contentsRaw.length >= maxRecordsPerFile || !file) {
        file = await makeThingFile(thing, fileNumber + 1);
        return { file: file, contents: [] };
    }

    return {
        file: file,
        contents: contentsRaw.map((c) => JSON.parse(c)),
    };
}

/**
 * load and parse a thing file
 * @param {string} file the file to load and parse
 */
async function getThingFile(file) {
    let contentsRaw = (await readFile(file, { encoding: "utf8" }))
        .split("\n")
        .filter((e) => e != "");

    return contentsRaw
        .map((c) => JSON.parse(c))
        .map((c) => {
            c.timestamp = new Date(c.timestamp);
            return c;
        });
}

async function makeThingFile(thing, number) {
    let filename = join(thingDir(thing), thingFilename(number));
    await writeFile(filename, "");
    return filename;
}

function thingDir(thing) {
    return join(appDir, thing);
}

function getNextThingId(thingFile, contents) {
    let fileId = basename(thingFile).split(".").shift();
    return `${fileId}-${contents.length}`;
}

async function getThings(thing, options = {}) {
    let retval = [];
    const defaultOptions = {};
    options = { ...defaultOptions, ...options };
    const thingFiles = await getThingFileList(thing);

    for (const file of thingFiles) {
        let things = await getThingFile(file);
        retval = [...retval, ...things.filter(getThingFilter(options))];
    }
    return retval.sort((a, b) => {
        if (a.timestamp > b.timestamp) {
            return 1;
        }
        if (a.timestamp < b.timestamp) {
            return -1;
        }
        return 0;
    });
}

/**
 * Filter to use in array.filter for filtering to the things you want only supports "startDate" and "endDate" now
 * @param {object} thingInstance an individual thing record
 * @param {object} options an object describing what to filter by
 */
function getThingFilter(options) {
    let retval = true;
    return (thingInstance) => {
        let timestamp = new Date(thingInstance.timestamp);
        if (options.startDate && timestamp < options.startDate) {
            return false;
        }
        if (options.endDate && timestamp > options.endDate) {
            return false;
        }
        return true;
    };
}

export { track, argvToThingOptions, setDefaultThing, getThings };
