import { join } from "node:path";
import { mkdir, cp, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { configFile } from "./utils.js";
import { exit } from "node:process";
import { existsSync } from "node:fs";
import { basename } from "path";

import { text, colors } from "./colors.js";

let config = false;

async function saveConfig() {
    await writeFile(JSON.stringify(config));
}

try {
    if (existsSync(configFile)) {
        const tmpConfig = await readFile(configFile);
        config = JSON.parse(tmpConfig);
    } else {
        if (process.argv[2] !== "init") {
            console.error(
                `Missing config file: ${configFile}\nPerhaps you want to run "${text(
                    colors.springgreen,
                    "rst init",
                )}"?\n`,
            );
        }
    }
} catch (error) {
    console.error("config parse error:", error);
    exit(1);
}

export default config;
