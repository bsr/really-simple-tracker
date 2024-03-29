import config from "./config.js";

import { join } from "node:path";
import { mkdir, cp, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { existsSync } from "node:fs";

import { isDate, parse } from "date-fns";

const __dirname = new URL(".", import.meta.url).pathname;

const appDir = join(homedir(), ".rst");
const configFile = join(appDir, "config.json");
const defaultConfigFile = join(__dirname, "..", "baseConfig.json");
const dateFormats = [
    "L-d-yyyy hh:mm:ss a", // 5-4-2022 2:33:00pm
    "L-d-yyyy hh:mma", // 5-4-2022 2:33pm
    "L-d-yyyy HH:mm:ss", // 5-4-2022 14:33:00
    "L-d-yyyy HH:mm", // 5-4-2022 14:33
    "L-d-yyyy", // 5-4-2022
    "L/d/yyyy hh:mm:ss a", // 5/4/2022 2:33:00pm
    "L/d/yyyy hh:mma", // 5/4/2022 2:33pm
    "L/d/yyyy HH:mm:ss", // 5/4/2022 14:33:00
    "L/d/yyyy HH:mm", // 5/4/2022 14:33
    "L/d/yyyy", // 5/4/2022

    "L-dd-yyyy hh:mm:ss a", // 5-04-2022 2:33:00pm
    "L-dd-yyyy hh:mma", // 5-04-2022 2:33pm
    "L-dd-yyyy HH:mm:ss", // 5-04-2022 14:33:00
    "L-dd-yyyy HH:mm", // 5-04-2022 14:33
    "L-dd-yyyy", // 5-04-2022
    "L/dd/yyyy hh:mm:ss a", // 5/04/2022 2:33:00pm
    "L/dd/yyyy hh:mma", // 5/04/2022 2:33pm
    "L/dd/yyyy HH:mm:ss", // 5/04/2022 14:33:00
    "L/dd/yyyy HH:mm", // 5/04/2022 14:33
    "L/dd/yyyy", // 5/04/2022

    "LLL d, yyyy  hh:mm:ssa", // May 4, 2022 2:33:00pm
    "LLL d, yyyy  HH:mm:ss", // May 4, 2022 14:33:00
    "LLL d, yyyy  hh:mma", // May 4, 2022 2:33pm
    "LLL d, yyyy  HH:mm", // May 4, 2022 14:33
    "LLL do, yyyy  hh:mm:ssa", // May 4th, 2022 2:33:00pm
    "LLL do, yyyy  HH:mm:ss", // May 4th, 2022 14:33:00
    "LLL do, yyyy  hh:mma", // May 4th, 2022 2:33pm
    "LLL do, yyyy  HH:mm", // May 4th, 2022 14:33
    "T", // javascript time (unixtime with ms)
    "t", // unixtime
];

async function initFiles(force = false) {
    if (!existsSync(configFile) || force) {
        await mkdir(appDir, { recursive: true });
        await cp(defaultConfigFile, configFile);
    } else {
        console.log(
            `${configFile} already exists use option --force to overwrite`,
        );
        return false;
    }
    return true;
}

async function init(force = false) {
    return await initFiles(force);
}

function parseDate(dateString) {
    if (isDate(dateString)) {
        return dateString;
    }

    let parsedDate = new Date(dateString);
    if (isDate(parsedDate)) {
        return parsedDate;
    }
    for (let i = 0; i < dateFormats.length; i++) {
        const parsed = parse(dateString, dateFormats[i], new Date());
        if (parsed != "Invalid Date") {
            return parsed;
        }
    }

    return false; // can't parse the timestamp
}

export { init, configFile, appDir, parseDate, dateFormats };
