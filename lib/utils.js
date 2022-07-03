import config from "./config.js";

import { join } from "node:path";
import { mkdir, cp, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { existsSync } from "node:fs";

const __dirname = new URL(".", import.meta.url).pathname;

const appDir = join(homedir(), ".rst");
const configFile = join(appDir, "config.json");
const defaultConfigFile = join(__dirname, "..", "baseConfig.json");

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

export { init, configFile, appDir };
